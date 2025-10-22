<?php
// app/Http/Resources/UsagePromoResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsagePromoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_usage' => $this->id_usage,
            'montant_remise' => $this->montant_remise,
            'date_utilisation' => $this->date_utilisation,
            'evenement' => $this->whenLoaded('evenement'),
            'commande' => $this->whenLoaded('commande'),
            'utilisateur' => $this->whenLoaded('utilisateur'),
        ];
    }
}