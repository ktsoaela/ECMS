<?php

namespace App\Http\Resources;

use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Campaign
 */
class CampaignDetailResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'subject' => $this->subject,
            'body' => $this->body,
            'recipient_count' => $this->recipient_count,
            'status' => $this->status->value,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'recipients' => $this->emailJobs->map(fn ($job) => [
                'recipient_email' => $job->recipient_email,
                'status' => $job->status->value,
            ])->values(),
        ];
    }
}
