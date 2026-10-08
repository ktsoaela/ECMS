<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Enums\EmailJobStatus;
use App\Jobs\ProcessEmailJob;
use App\Models\Campaign;
use App\Models\EmailJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ProcessEmailJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_queued_email_job_is_marked_sent(): void
    {
        $campaign = Campaign::query()->create([
            'name' => 'Spring Sale',
            'subject' => 'Hello',
            'body' => 'Body',
            'recipient_count' => 1,
            'status' => CampaignStatus::Queued,
        ]);

        $emailJob = $campaign->emailJobs()->create([
            'recipient_email' => 'email1@test.com',
            'status' => EmailJobStatus::Pending,
        ]);

        (new ProcessEmailJob($emailJob->id))->handle();

        $emailJob->refresh();
        $campaign->refresh();

        $this->assertSame(EmailJobStatus::Sent, $emailJob->status);
        $this->assertSame(CampaignStatus::Done, $campaign->status);
    }

    public function test_failed_job_is_isolated_from_other_recipients(): void
    {
        Log::shouldReceive('info')->andReturnNull();
        Log::shouldReceive('error')->once();

        $campaign = Campaign::query()->create([
            'name' => 'Spring Sale',
            'subject' => 'Hello',
            'body' => 'Body',
            'recipient_count' => 2,
            'status' => CampaignStatus::Queued,
        ]);

        $failing = $campaign->emailJobs()->create([
            'recipient_email' => 'fail@test.com',
            'status' => EmailJobStatus::Pending,
        ]);

        $ok = $campaign->emailJobs()->create([
            'recipient_email' => 'ok@test.com',
            'status' => EmailJobStatus::Pending,
        ]);

        $job = new class($failing->id) extends ProcessEmailJob
        {
            public function handle(): void
            {
                $emailJob = EmailJob::query()->with('campaign')->find($this->emailJobId);

                if ($emailJob === null || $emailJob->status !== EmailJobStatus::Pending) {
                    return;
                }

                $campaign = $emailJob->campaign;
                $campaign?->update(['status' => CampaignStatus::Processing]);

                try {
                    throw new \RuntimeException('Simulated send failure');
                } catch (\Throwable $exception) {
                    Log::error("Failed to process email {$emailJob->recipient_email}: {$exception->getMessage()}");
                    $emailJob->update(['status' => EmailJobStatus::Failed]);
                }

                $campaign = $campaign?->fresh();
                if ($campaign !== null && ! $campaign->emailJobs()->where('status', EmailJobStatus::Pending)->exists()) {
                    $campaign->update(['status' => CampaignStatus::Done]);
                }
            }
        };

        $job->handle();
        (new ProcessEmailJob($ok->id))->handle();

        $this->assertSame(EmailJobStatus::Failed, $failing->fresh()->status);
        $this->assertSame(EmailJobStatus::Sent, $ok->fresh()->status);
        $this->assertSame(CampaignStatus::Done, $campaign->fresh()->status);
    }

    public function test_non_pending_jobs_are_skipped(): void
    {
        $campaign = Campaign::query()->create([
            'name' => 'Spring Sale',
            'subject' => 'Hello',
            'body' => 'Body',
            'recipient_count' => 1,
            'status' => CampaignStatus::Done,
        ]);

        $emailJob = $campaign->emailJobs()->create([
            'recipient_email' => 'email1@test.com',
            'status' => EmailJobStatus::Sent,
        ]);

        (new ProcessEmailJob($emailJob->id))->handle();

        $this->assertSame(EmailJobStatus::Sent, $emailJob->fresh()->status);
    }
}
