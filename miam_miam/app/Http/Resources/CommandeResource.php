<?php


namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CommandeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id_commande,
            'statut' => $this->statut_commande,
            'type_livraison' => $this->type_livraison,
            'heure_arrivee' => $this->heure_arrivee,
            'adresse_livraison' => $this->adresse_livraison,
            'commentaire' => $this->commentaire_client,
            'montant_total' => $this->montant_total,
            'montant_remise' => $this->montant_remise,
            'montant_final' => $this->montant_final,
            'points_utilises' => $this->points_utilises,
            'date_commande' => $this->date_commande,
            'utilisateur' => [
                'id' => $this->utilisateur->id ?? null,
                'nom' => $this->utilisateur->nom ?? '',
                'prenom' => $this->utilisateur->prenom ?? '',
                'email' => $this->utilisateur->email ?? '',
                'telephone' => $this->utilisateur->telephone ?? '',
            ],
            'details' => DetailCommandeResource::collection($this->whenLoaded('details'))
        ];
    }
}