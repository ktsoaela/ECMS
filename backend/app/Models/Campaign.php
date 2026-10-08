<?php

namespace App\Models;

use App\Enums\CampaignStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'subject', 'body', 'recipient_count', 'status'])]
class Campaign extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recipient_count' => 'integer',
            'status' => CampaignStatus::class,
        ];
    }

    /**
     * @return HasMany<EmailJob, $this>
     */
    public function emailJobs(): HasMany
    {
        return $this->hasMany(EmailJob::class);
    }
}
