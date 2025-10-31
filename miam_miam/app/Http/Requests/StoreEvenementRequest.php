<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvenementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // L'autorisation est gérée par le middleware role
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        $id = $this->route('id');
        return [
            'code_promo' => 'nullable|string|max:40|unique:evenements,code_promo,' . $id . ',id_evenement',
            'titre' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:promotion,jeu,evenement',
            'type_remise' => 'nullable|in:pourcentage,fixe,point_bonus',
            'valeur_remise' => 'nullable|numeric|min:0',
            'url_affiche' => 'nullable|url|max:500',
            'affiche' => 'sometimes|file|mimes:jpg,jpeg,png,webp|max:3072',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'active' => 'nullable|in:oui,non',
            'limite_utilisation' => 'nullable|integer|min:0',
        ];
    }
}
