<?php
// app/Http/Requests/StoreUsagePromoRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsagePromoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_evenement' => 'required|exists:evenements,id',
            'id_commande' => 'required|exists:commandes,id_commande',
            'id_utilisateur' => 'required|exists:users,id',
            'montant_remise' => 'required|numeric|min:0',
        ];
    }
}