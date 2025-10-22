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
            'id' => $this->id,
            'titre' => $this->titre,
            'description' => $this->description,
            'type' => $this->type,
            'url_affiche' => $this->url_affiche ? asset($this->url_affiche) : null,
            'date_debut' => $this->date_debut->format('Y-m-d H:i:s'),
            'date_fin' => $this->date_fin->format('Y-m-d H:i:s'),
            'active' => $this->active,
            'participants_max' => $this->participants_max,
            'points_recompense' => $this->points_recompense,
            'reduction_recompense' => $this->reduction_recompense,
            'article_gratuit' => $this->article_gratuit,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            
            // Relations conditionnelles
            'createur' => $this->whenLoaded('createur', function () {
                return [
                    'id' => $this->createur->id,
                    'nom' => $this->createur->name,
                    'email' => $this->createur->email
                ];
            }),
            
            'nombre_participants' => $this->whenLoaded('participants', function () {
                return $this->participants->count();
            }, 0),
            
            'est_complet' => $this->when($this->participants_max, function () {
                return $this->participants->count() >= $this->participants_max;
            }, false),
        ];
    }
}