<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Enums\EmailJobStatus;
use App\Jobs\ProcessEmailJob;
use App\Models\Campaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CampaignSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_campaign_can_be_submitted(): void
    {
        Queue::fake();

        $payload = [
            'name' => 'Spring Sale',
            'subject' => '50% Off This Weekend!',
            'body' => 'Check out our amazing deals...',
            'recipient_emails' => [
                'email1@test.com',
                'email2@test.com',
            ],
        ];

        $response = $this->postJson('/api/campaigns', $payload);

        $response->assertCreated()
            ->assertJsonPath('status', 'queued')
            ->assertJsonPath('recipient_count', 2)
            ->assertJsonStructure(['campaign_id', 'recipient_count', 'status']);

        $campaign = Campaign::query()->findOrFail($response->json('campaign_id'));

        $this->assertSame('Spring Sale', $campaign->name);
        $this->assertSame('50% Off This Weekend!', $campaign->subject);
        $this->assertSame('Check out our amazing deals...', $campaign->body);
        $this->assertSame(2, $campaign->recipient_count);
        $this->assertSame(CampaignStatus::Queued, $campaign->status);
        $this->assertSame(2, $campaign->emailJobs()->count());
        $this->assertTrue(
            $campaign->emailJobs->every(
                fn ($job) => $job->status === EmailJobStatus::Pending
                    && $job->campaign_id === $campaign->id
            )
        );

        Queue::assertPushed(ProcessEmailJob::class, 2);
    }

    public function test_missing_required_fields_are_rejected(): void
    {
        $response = $this->postJson('/api/campaigns', []);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Invalid input')
            ->assertJsonStructure(['error', 'details']);
    }

    public function test_invalid_email_addresses_are_rejected(): void
    {
        $response = $this->postJson('/api/campaigns', [
            'name' => 'Spring Sale',
            'subject' => 'Hello',
            'body' => 'Body',
            'recipient_emails' => ['not-an-email'],
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Invalid input')
            ->assertJsonPath('details.recipient_emails', 'Must contain valid emails');
    }

    public function test_duplicate_email_addresses_are_rejected(): void
    {
        $response = $this->postJson('/api/campaigns', [
            'name' => 'Spring Sale',
            'subject' => 'Hello',
            'body' => 'Body',
            'recipient_emails' => [
                'A@test.com',
                'a@test.com',
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Invalid input')
            ->assertJsonPath('details.recipient_emails', 'Duplicate email addresses are not accepted');
    }
}
