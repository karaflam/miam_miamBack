<?php

    namespace App\Services;
    
    use App\Models\Commande;
    use App\Models\SuiviPoint;
class FideliteService {
      
      public function attribuerPoints(Commande $commande): int {
          // Règle: 1000 FCFA = 1 point
          $pointsGagnes = floor($commande->montant_final / 1000);
          
          if ($pointsGagnes > 0) {
              $user = $commande->utilisateur;
              $user->increment('point_fidelite', $pointsGagnes);
              
              // Enregistrer dans historique
              SuiviPoint::create([
                  'id_utilisateur' => $user->id_utilisateur,
                  'id_commande' => $commande->id_commande,
                  'variation_points' => $pointsGagnes,
                  'solde_apres' => $user->point_fidelite,
                  'source_points' => 'commande',
                  'date_expiration' => now()->addYear(),  // Expire dans 12 mois
              ]);
          }
          
          return $pointsGagnes;
      }
      
      public function historique($userId) {
          return SuiviPoint::where('id_utilisateur', $userId)
                          ->orderBy('date_enregistrement', 'desc')
                          ->get();
      }
  }
