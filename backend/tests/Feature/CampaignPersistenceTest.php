<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Enums\EmailJobStatus;
use App\Models\Campaign;
use App\Models\EmailJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampaignPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_campaign_has_many_email_jobs(): void
    {
        $campaign = Campaign::query()->create([
            'name' => 'Spring Sale',
            'subject' => '50% Off This Weekend!',
            'body' => 'Check out our amazing deals...',
            'recipient_count' => 2,
            'status' => CampaignStatus::Queued,
        ]);

        $campaign->emailJobs()->createMany([
            [
                'recipient_email' => 'email1@test.com',
                'status' => EmailJobStatus::Pending,
            ],
            [
                'recipient_email' => 'email2@test.com',
                'status' => EmailJobStatus::Pending,
            ],
        ]);

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'status' => CampaignStatus::Queued->value,
            'recipient_count' => 2,
        ]);

        $this->assertSame(2, $campaign->emailJobs()->count());
        $this->assertTrue(
            $campaign->emailJobs->every(
                fn (EmailJob $job) => $job->campaign_id === $campaign->id
                    && $job->status === EmailJobStatus::Pending
            )
        );
    }
}
