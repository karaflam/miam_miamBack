<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id_utilisateur ?? $this->id,
            'nom' => $this->nom,
            'email' => $this->email,
            'point_fidelite' => $this->point_fidelite ?? 0,
            'code_parrainage' => $this->code_parrainage ?? null,
        ];
    }
}