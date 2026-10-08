<?php

namespace App\Jobs;

use App\Enums\CampaignStatus;
use App\Enums\EmailJobStatus;
use App\Models\Campaign;
use App\Models\EmailJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessEmailJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $emailJobId) {}

    public function handle(): void
    {
        $emailJob = EmailJob::query()->with('campaign')->find($this->emailJobId);

        if ($emailJob === null || $emailJob->status !== EmailJobStatus::Pending) {
            return;
        }

        $campaign = $emailJob->campaign;

        if ($campaign === null) {
            return;
        }

        if ($campaign->status === CampaignStatus::Queued) {
            $campaign->update(['status' => CampaignStatus::Processing]);
            Log::info("Processing campaign {$campaign->id}");
        }

        try {
            Log::info("Processing email: {$emailJob->recipient_email}");

            // Simulated send — no external mail provider.
            $emailJob->update(['status' => EmailJobStatus::Sent]);

            Log::info('Email sent successfully');
        } catch (Throwable $exception) {
            Log::error("Failed to process email {$emailJob->recipient_email}: {$exception->getMessage()}");
            $emailJob->update(['status' => EmailJobStatus::Failed]);
        }

        $this->refreshCampaignStatus($campaign->fresh());
    }

    private function refreshCampaignStatus(?Campaign $campaign): void
    {
        if ($campaign === null) {
            return;
        }

        $hasPending = $campaign->emailJobs()
            ->where('status', EmailJobStatus::Pending)
            ->exists();

        if ($hasPending) {
            return;
        }

        $campaign->update(['status' => CampaignStatus::Done]);
        Log::info("Campaign {$campaign->id} completed");
    }
}
