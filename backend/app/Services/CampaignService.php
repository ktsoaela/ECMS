<?php

namespace App\Services;

use App\Enums\CampaignStatus;
use App\Enums\EmailJobStatus;
use App\Jobs\ProcessEmailJob;
use App\Models\Campaign;
use Illuminate\Support\Facades\DB;

class CampaignService
{
    /**
     * @param  array{name: string, subject: string, body: string, recipient_emails: list<string>}  $data
     */
    public function create(array $data): Campaign
    {
        $emails = $data['recipient_emails'];

        $campaign = DB::transaction(function () use ($data, $emails) {
            $campaign = Campaign::query()->create([
                'name' => $data['name'],
                'subject' => $data['subject'],
                'body' => $data['body'],
                'recipient_count' => count($emails),
                'status' => CampaignStatus::Queued,
            ]);

            foreach ($emails as $email) {
                $campaign->emailJobs()->create([
                    'recipient_email' => $email,
                    'status' => EmailJobStatus::Pending,
                ]);
            }

            return $campaign->load('emailJobs');
        });

        foreach ($campaign->emailJobs as $emailJob) {
            ProcessEmailJob::dispatch($emailJob->id)->afterCommit();
        }

        return $campaign;
    }
}
