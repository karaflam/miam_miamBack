<?php


namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InitierPaiementRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'commande_id' => 'required|exists:commandes,id_commande',
            'methode_paiement' => 'required|string|in:carte,mobile_money,points'
        ];
    }
}