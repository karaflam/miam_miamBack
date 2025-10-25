<?php


namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id_article,
            'nom' => $this->nom_article,
            'description' => $this->description,
            'prix' => (float) $this->prix,
            'image' => $this->url_image,
            'disponible' => $this->disponible === 'oui',
            'temps_preparation' => $this->temps_preparation,
            'categorie' => new CategorieResource($this->whenLoaded('categorie')),
            'stock' => $this->whenLoaded('stock', function() {
                return [
                    'quantite_disponible' => $this->stock->quantite_disponible
                ];
            }),
            'date_creation' => $this->date_creation?->format('Y-m-d H:i:s'),
            'date_modification' => $this->date_modification?->format('Y-m-d H:i:s'),
        ];
    }
}