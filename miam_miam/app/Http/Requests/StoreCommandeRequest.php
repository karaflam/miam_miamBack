<?php


namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommandeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'type_livraison' => 'required|string|in:sur_place,livraison',
            'heure_arrivee' => 'nullable|date_format:H:i',
            'adresse_livraison' => 'nullable|string|max:255',
            'commentaire_client' => 'nullable|string|max:500',
            'articles' => 'required|array|min:1',
            'articles.*.id' => 'required|integer|exists:menus,id_article',
            'articles.*.prix' => 'required|numeric|min:0',
            'articles.*.quantite' => 'required|integer|min:1',
            'points_utilises' => 'nullable|integer|min:0',
        ];
    }
}