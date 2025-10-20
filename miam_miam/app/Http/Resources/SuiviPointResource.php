<?php


namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SuiviPointResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id_suivi ?? $this->id,
            'variation_points' => $this->variation_points,
            'solde_apres' => $this->solde_apres,
            'source_points' => $this->source_points,
            'created_at' => $this->created_at,
        ];
    }
}