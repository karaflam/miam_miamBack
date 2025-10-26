<?php


namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DetailCommandeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id_detail,
            'id_article' => $this->id_article,
            'prix_unitaire' => $this->prix_unitaire,
            'quantite' => $this->quantite,
            'article' => $this->when($this->relationLoaded('article'), function() {
                return [
                    'id' => $this->article->id_article ?? null,
                    'nom' => $this->article->nom_article ?? '',
                    'description' => $this->article->description ?? '',
                    'prix' => $this->article->prix ?? 0,
                ];
            })
        ];
    }
}