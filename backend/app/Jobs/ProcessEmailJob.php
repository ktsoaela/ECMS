<?php

namespace App\Jobs;

use App\Enums\CampaignStatus;
use App\Enums\EmailJobStatus;
use App\Mail\CampaignMail;
use App\Models\Campaign;
use App\Models\EmailJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ProcessEmailJob implements ShouldQueue
{
    use Queueable;

    /** Attempts before the recipient is marked failed (ADR-0012). */
    public int $tries = 3;

    public int $timeout = 60;

    public function __construct(public int $emailJobId) {}

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [10, 30];
    }

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

        Log::info("Sending email to {$emailJob->recipient_email} (attempt {$this->attempts()})");

        try {
            Mail::to($emailJob->recipient_email)->send(new CampaignMail($campaign));
        } catch (Throwable $exception) {
            // Leave the row pending so the queue can retry; failed() marks it after the last attempt.
            Log::warning("Send to {$emailJob->recipient_email} failed: {$exception->getMessage()}");

            throw $exception;
        }

        $emailJob->update(['status' => EmailJobStatus::Sent]);
        Log::info("Email sent to {$emailJob->recipient_email}");

        $this->refreshCampaignStatus($campaign->fresh());
        $this->pauseBetweenSends();
    }

    public function failed(?Throwable $exception): void
    {
        $emailJob = EmailJob::query()->with('campaign')->find($this->emailJobId);

        if ($emailJob === null || $emailJob->status !== EmailJobStatus::Pending) {
            return;
        }

        Log::error("Giving up on {$emailJob->recipient_email}: {$exception?->getMessage()}");
        $emailJob->update(['status' => EmailJobStatus::Failed]);

        $this->refreshCampaignStatus($emailJob->campaign?->fresh());
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

    private function pauseBetweenSends(): void
    {
        $intervalMs = (int) config('mail.send_interval_ms', 0);

        if ($intervalMs > 0) {
            usleep($intervalMs * 1000);
        }
    }
}
