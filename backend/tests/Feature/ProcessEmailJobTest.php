<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Enums\EmailJobStatus;
use App\Jobs\ProcessEmailJob;
use App\Mail\CampaignMail;
use App\Models\Campaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Tests\TestCase;

class ProcessEmailJobTest extends TestCase
{
    use RefreshDatabase;

    private function campaign(int $recipients = 1, string $body = 'Body'): Campaign
    {
        return Campaign::query()->create([
            'name' => 'Spring Sale',
            'subject' => 'Hello',
            'body' => $body,
            'recipient_count' => $recipients,
            'status' => CampaignStatus::Queued,
        ]);
    }

    public function test_queued_email_job_is_sent_and_marked_sent(): void
    {
        Mail::fake();

        $campaign = $this->campaign();
        $emailJob = $campaign->emailJobs()->create([
            'recipient_email' => 'email1@test.com',
            'status' => EmailJobStatus::Pending,
        ]);

        (new ProcessEmailJob($emailJob->id))->handle();

        Mail::assertSent(CampaignMail::class, fn (CampaignMail $mail) => $mail->hasTo('email1@test.com')
            && $mail->campaign->is($campaign));
        $this->assertSame(EmailJobStatus::Sent, $emailJob->fresh()->status);
        $this->assertSame(CampaignStatus::Done, $campaign->fresh()->status);
    }

    public function test_transport_error_keeps_job_pending_for_retry(): void
    {
        Mail::shouldReceive('to->send')->andThrow(new RuntimeException('SMTP down'));

        $campaign = $this->campaign();
        $emailJob = $campaign->emailJobs()->create([
            'recipient_email' => 'retry@test.com',
            'status' => EmailJobStatus::Pending,
        ]);

        try {
            (new ProcessEmailJob($emailJob->id))->handle();
            $this->fail('Transport error should be rethrown for the queue to retry.');
        } catch (RuntimeException) {
        }

        $this->assertSame(EmailJobStatus::Pending, $emailJob->fresh()->status);
        $this->assertSame(CampaignStatus::Processing, $campaign->fresh()->status);
    }

    public function test_failed_job_is_isolated_from_other_recipients(): void
    {
        Mail::fake();

        $campaign = $this->campaign(2);
        $failing = $campaign->emailJobs()->create([
            'recipient_email' => 'fail@test.com',
            'status' => EmailJobStatus::Pending,
        ]);
        $ok = $campaign->emailJobs()->create([
            'recipient_email' => 'ok@test.com',
            'status' => EmailJobStatus::Pending,
        ]);

        // The worker calls failed() once the last attempt has thrown.
        (new ProcessEmailJob($failing->id))->failed(new RuntimeException('Mailbox unavailable'));
        $this->assertSame(CampaignStatus::Queued, $campaign->fresh()->status);

        (new ProcessEmailJob($ok->id))->handle();

        $this->assertSame(EmailJobStatus::Failed, $failing->fresh()->status);
        $this->assertSame(EmailJobStatus::Sent, $ok->fresh()->status);
        $this->assertSame(CampaignStatus::Done, $campaign->fresh()->status);
        Mail::assertSentCount(1);
    }

    public function test_non_pending_jobs_are_skipped(): void
    {
        Mail::fake();

        $campaign = $this->campaign();
        $campaign->update(['status' => CampaignStatus::Done]);
        $emailJob = $campaign->emailJobs()->create([
            'recipient_email' => 'email1@test.com',
            'status' => EmailJobStatus::Sent,
        ]);

        (new ProcessEmailJob($emailJob->id))->handle();
        (new ProcessEmailJob($emailJob->id))->failed(new RuntimeException('late'));

        Mail::assertNothingSent();
        $this->assertSame(EmailJobStatus::Sent, $emailJob->fresh()->status);
    }

    public function test_plain_body_is_escaped_and_composer_html_is_kept(): void
    {
        $plain = new CampaignMail($this->campaign(body: "Hi <b>there</b>\nBye"));
        $plain->assertSeeInHtml('Hi &lt;b&gt;there&lt;/b&gt;<br />', false);

        $html = new CampaignMail($this->campaign(
            body: "<section data-email-template=\"1\">\n<h1>Sale</h1>\n<script>alert(1)</script><p><a href=\"https://example.com\">Shop</a></p>\n</section>"
        ));
        $html->assertSeeInHtml('<h1>Sale</h1>', false);
        $html->assertDontSeeInHtml('<script>', false);
        $html->assertSeeInText('Shop');
        $html->assertHasSubject('Hello');
    }
}
