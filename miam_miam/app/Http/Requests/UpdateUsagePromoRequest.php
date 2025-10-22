<?php
// app/Http/Requests/UpdateUsagePromoRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUsagePromoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'montant_remise' => 'sometimes|numeric|min:0',
        ];
    }
}