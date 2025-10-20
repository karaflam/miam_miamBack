<?php


namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id_article,
            'nom' => $this->nom,
            'description' => $this->description,
            'prix' => $this->prix,
            'image' => $this->image,
            'disponible' => $this->disponible,
            'categorie' => new CategorieResource($this->whenLoaded('categorie')),
            'stock' => $this->whenLoaded('stock', function() {
                return [
                    'quantite_disponible' => $this->stock->quantite_disponible
                ];
            })
        ];
    }
}