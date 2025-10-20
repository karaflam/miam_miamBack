<?php

    namespace App\Services;
    
    use App\Models\Commande;
    use App\Models\Parrainage;
    use App\Models\SuiviPoint;
    use App\Models\User;
    use Illuminate\Support\Facades\DB;
class ParrainageService {
      
      public function verifierPremiereCommande(Commande $commande): void {
          $filleul = $commande->utilisateur;
          
          // Vérifier s'il a un parrain
          if (!$filleul->id_parrain) {
              return;
          }
          
          // Vérifier si c'est sa première commande validée
          $premiereCommande = Commande::where('id_utilisateur', $filleul->id_utilisateur)
                                     ->where('statut_commande', 'validee')
                                     ->count() === 1;
          
          if (!$premiereCommande) {
              return;
          }
          
          // Trouver le parrainage
          $parrainage = Parrainage::where('id_filleul', $filleul->id_utilisateur)
                                  ->where('recompense_attribuee', 'non')
                                  ->first();
          
          if ($parrainage) {
              $this->recompenserParrain($parrainage);
          }
      }
      
      private function recompenserParrain(Parrainage $parrainage): void {
          $pointsBonus = 5;  // Définir le montant de la récompense
          
          DB::transaction(function() use ($parrainage, $pointsBonus) {
              $parrain = User::find($parrainage->id_parrain);
              $parrain->increment('point_fidelite', $pointsBonus);
              
              // Marquer récompense attribuée
              $parrainage->update([
                  'recompense_attribuee' => 'oui',
                  'points_recompense' => $pointsBonus,
                  'date_recompense' => now(),
              ]);
              
              // Enregistrer dans historique
              SuiviPoint::create([
                  'id_utilisateur' => $parrain->id_utilisateur,
                  'id_parrainage' => $parrainage->id_parrainage,
                  'variation_points' => $pointsBonus,
                  'solde_apres' => $parrain->point_fidelite,
                  'source_points' => 'parrainage',
              ]);
          });
      }
  }
