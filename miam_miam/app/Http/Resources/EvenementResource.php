<?php
// app/Http/Resources/EvenementResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvenementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_evenement' => $this->id_evenement,
            'code_promo' => $this->code_promo,
            'titre' => $this->titre,
            'description' => $this->description,
            'type' => $this->type,
            'type_remise' => $this->type_remise,
            'valeur_remise' => $this->valeur_remise,
            'url_affiche' => $this->url_affiche ? asset($this->url_affiche) : null,
            'date_debut' => $this->date_debut ? $this->date_debut->format('Y-m-d') : null,
            'date_fin' => $this->date_fin ? $this->date_fin->format('Y-m-d') : null,
            'active' => $this->active,
            'limite_utilisation' => $this->limite_utilisation,
            'nombre_utilisation' => $this->nombre_utilisation,
            'is_integrated' => (bool) $this->is_integrated, // Marqueur pour jeux intégrés
            'date_creation' => $this->date_creation ? $this->date_creation->format('Y-m-d H:i:s') : null,
        ];
    }
}