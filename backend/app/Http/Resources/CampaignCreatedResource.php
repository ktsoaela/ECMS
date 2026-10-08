<?php

namespace App\Http\Resources;

use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Campaign
 */
class CampaignCreatedResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array{campaign_id: int, recipient_count: int, status: string}
     */
    public function toArray(Request $request): array
    {
        return [
            'campaign_id' => $this->id,
            'recipient_count' => $this->recipient_count,
            'status' => $this->status->value,
        ];
    }
}
