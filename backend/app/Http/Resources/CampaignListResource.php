<?php

namespace App\Http\Resources;

use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Campaign
 */
class CampaignListResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array{id: int, name: string, subject: string, recipient_count: int, status: string, created_at: string}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'subject' => $this->subject,
            'recipient_count' => $this->recipient_count,
            'status' => $this->status->value,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
