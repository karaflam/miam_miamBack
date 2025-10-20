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
        ];
    }
}