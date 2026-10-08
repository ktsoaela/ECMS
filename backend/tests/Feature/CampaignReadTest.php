<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Enums\EmailJobStatus;
use App\Models\Campaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampaignReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_campaigns_can_be_listed(): void
    {
        $campaign = Campaign::query()->create([
            'name' => 'Spring Sale',
            'subject' => '50% Off This Weekend!',
            'body' => 'Deals',
            'recipient_count' => 1,
            'status' => CampaignStatus::Processing,
        ]);

        $response = $this->getJson('/api/campaigns');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $campaign->id)
            ->assertJsonPath('0.name', 'Spring Sale')
            ->assertJsonPath('0.subject', '50% Off This Weekend!')
            ->assertJsonPath('0.recipient_count', 1)
            ->assertJsonPath('0.status', 'processing')
            ->assertJsonStructure([['id', 'name', 'subject', 'recipient_count', 'status', 'created_at']]);
    }

    public function test_campaign_details_include_recipients(): void
    {
        $campaign = Campaign::query()->create([
            'name' => 'Spring Sale',
            'subject' => 'Hello',
            'body' => 'Body text',
            'recipient_count' => 2,
            'status' => CampaignStatus::Queued,
        ]);

        $campaign->emailJobs()->createMany([
            ['recipient_email' => 'john@test.com', 'status' => EmailJobStatus::Sent],
            ['recipient_email' => 'mary@test.com', 'status' => EmailJobStatus::Pending],
        ]);

        $response = $this->getJson("/api/campaigns/{$campaign->id}");

        $response->assertOk()
            ->assertJsonPath('id', $campaign->id)
            ->assertJsonPath('body', 'Body text')
            ->assertJsonPath('recipients.0.recipient_email', 'john@test.com')
            ->assertJsonPath('recipients.0.status', 'sent')
            ->assertJsonPath('recipients.1.recipient_email', 'mary@test.com')
            ->assertJsonPath('recipients.1.status', 'pending');
    }

    public function test_unknown_campaign_returns_not_found(): void
    {
        $this->getJson('/api/campaigns/999')->assertNotFound();
    }
}
