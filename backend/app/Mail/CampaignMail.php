<?php

namespace App\Mail;

use App\Models\Campaign;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Str;

class CampaignMail extends Mailable
{
    /** Tags the block composer can emit (ADR-0011). Anything else is stripped. */
    private const ALLOWED_TAGS = '<section><h1><p><br><a><img>';

    public function __construct(public Campaign $campaign) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->campaign->subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.campaign',
            text: 'emails.campaign-text',
            with: [
                'bodyHtml' => $this->bodyHtml(),
                'bodyText' => $this->bodyText(),
            ],
        );
    }

    private function isComposerHtml(): bool
    {
        return Str::startsWith(ltrim($this->campaign->body), '<section data-email-template="1">');
    }

    private function bodyHtml(): string
    {
        if ($this->isComposerHtml()) {
            return strip_tags($this->campaign->body, self::ALLOWED_TAGS);
        }

        return nl2br(e($this->campaign->body));
    }

    private function bodyText(): string
    {
        if (! $this->isComposerHtml()) {
            return $this->campaign->body;
        }

        $text = preg_replace('/<br\s*\/?>|<\/(p|h1)>/i', "\n", $this->campaign->body);

        return trim(html_entity_decode(strip_tags((string) $text), ENT_QUOTES | ENT_HTML5));
    }
}
