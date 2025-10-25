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
            'prenom' => $this->prenom,
            'email' => $this->email,
            'telephone' => $this->telephone,
            'localisation' => $this->localisation,
            'point_fidelite' => $this->point_fidelite ?? 0,
            'code_parrainage' => $this->code_parrainage ?? null,
            'statut' => $this->statut ?? 'actif',
            'date_creation' => $this->date_creation ? $this->date_creation->format('Y-m-d H:i:s') : null,
            'date_modification' => $this->date_modification ? $this->date_modification->format('Y-m-d H:i:s') : null,
            
            // Relations conditionnelles (chargées uniquement si disponibles)
            'parrain' => $this->when($this->relationLoaded('parrain') && $this->parrain, [
                'id' => $this->parrain->id_utilisateur ?? null,
                'nom' => $this->parrain->nom ?? null,
                'prenom' => $this->parrain->prenom ?? null,
                'email' => $this->parrain->email ?? null,
            ]),
            
            'nombre_filleuls' => $this->when($this->relationLoaded('filleuls'), $this->filleuls->count()),
            'filleuls' => $this->when($this->relationLoaded('filleuls'), function() {
                return $this->filleuls->map(function($filleul) {
                    return [
                        'id' => $filleul->id_utilisateur,
                        'nom' => $filleul->nom,
                        'prenom' => $filleul->prenom,
                        'email' => $filleul->email,
                        'date_creation' => $filleul->date_creation ? $filleul->date_creation->format('Y-m-d H:i:s') : null,
                    ];
                });
            }),
            
            'nombre_commandes' => $this->when($this->relationLoaded('commandes'), $this->commandes->count()),
            'commandes_recentes' => $this->when($this->relationLoaded('commandes'), function() {
                return $this->commandes->take(5)->map(function($commande) {
                    return [
                        'id' => $commande->id_commande,
                        'montant_total' => $commande->montant_total,
                        'statut' => $commande->statut,
                        'date_commande' => $commande->date_commande ? $commande->date_commande->format('Y-m-d H:i:s') : null,
                    ];
                });
            }),
            
            'total_depense' => $this->when($this->relationLoaded('paiements'), function() {
                return $this->paiements->where('statut', 'complete')->sum('montant');
            }),
            
            'nombre_reclamations' => $this->when($this->relationLoaded('reclamations'), $this->reclamations->count()),
            
            'derniere_activite' => $this->when($this->relationLoaded('activites'), function() {
                $derniereActivite = $this->activites->sortByDesc('date_activite')->first();
                return $derniereActivite ? $derniereActivite->date_activite->format('Y-m-d H:i:s') : null;
            }),
        ];
    }
}