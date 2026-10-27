<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

trait ReturnsValidationDetails
{
    protected function failedValidation(Validator $validator): void
    {
        $details = [];

        foreach ($validator->errors()->messages() as $field => $messages) {
            $key = str_starts_with($field, 'recipient_emails') ? 'recipient_emails' : $field;
            $details[$key] = $messages[0];
        }

        throw new HttpResponseException(response()->json([
            'error' => 'Invalid input',
            'details' => $details,
        ], 422));
    }
}
