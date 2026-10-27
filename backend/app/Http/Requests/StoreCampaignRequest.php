<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ReturnsValidationDetails;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCampaignRequest extends FormRequest
{
    use ReturnsValidationDetails;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $emails = $this->input('recipient_emails', []);

        if (! is_array($emails)) {
            return;
        }

        $normalised = array_map(
            static fn ($email) => is_string($email) ? strtolower(trim($email)) : $email,
            $emails
        );

        $this->merge([
            'recipient_emails' => $normalised,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'recipient_emails' => ['required', 'array', 'min:1'],
            'recipient_emails.*' => [
                'required',
                'email:rfc',
                'distinct',
                Rule::notIn(['']),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Campaign name is required',
            'subject.required' => 'Subject is required',
            'body.required' => 'Body is required',
            'recipient_emails.required' => 'Must contain valid emails',
            'recipient_emails.min' => 'Must contain valid emails',
            'recipient_emails.*.required' => 'Must contain valid emails',
            'recipient_emails.*.email' => 'Must contain valid emails',
            'recipient_emails.*.distinct' => 'Duplicate email addresses are not accepted',
        ];
    }
}
