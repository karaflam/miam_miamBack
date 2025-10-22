<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StatistiqueResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type_statistique' => $this->type_statistique,
            'valeur' => $this->valeur,
            'periode' => $this->periode,
            'date_statistique' => $this->date_statistique,
        ];
    }
}


