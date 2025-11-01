<?php
// app/Http/Resources/EvenementResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\ParticipationEvenement;
use Illuminate\Support\Facades\Auth;

class EvenementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = Auth::user();
        $participationsAujourdhui = 0;
        
        // Compter les participations d'aujourd'hui pour l'utilisateur connecté
        if ($user && isset($user->id_utilisateur)) {
            $participationsAujourdhui = ParticipationEvenement::where('id_etudiant', $user->id_utilisateur)
                ->where('id_evenement', $this->id_evenement)
                ->where('date_participation', now()->toDateString())
                ->count();
        }
        
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
            'participations_aujourdhui' => $participationsAujourdhui, // Nombre de fois joué aujourd'hui
            'participations_restantes' => $this->limite_utilisation ? max(0, $this->limite_utilisation - $participationsAujourdhui) : null,
            'is_integrated' => (bool) $this->is_integrated, // Marqueur pour jeux intégrés
            'date_creation' => $this->date_creation ? $this->date_creation->format('Y-m-d H:i:s') : null,
        ];
    }
}