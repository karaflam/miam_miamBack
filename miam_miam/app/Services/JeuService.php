<?php

namespace App\Services;

use App\Models\Evenement;
use App\Models\UsagePromo;
use App\Models\User;
use App\Models\SuiviPoint;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class JeuService
{
    /**
     * Vérifier si un utilisateur peut jouer à un jeu
     */
    public function peutJouer($jeuId, $userId): array
    {
        $jeu = Evenement::findOrFail($jeuId);

        // Vérifier que c'est bien un jeu
        if ($jeu->type !== 'jeu') {
            return [
                'peut_jouer' => false,
                'raison' => 'Cet événement n\'est pas un jeu'
            ];
        }

        // Vérifier que le jeu est actif
        if ($jeu->active !== 'oui') {
            return [
                'peut_jouer' => false,
                'raison' => 'Ce jeu n\'est pas actif'
            ];
        }

        // Vérifier les dates
        $today = Carbon::today();
        if ($today->lt($jeu->date_debut) || $today->gt($jeu->date_fin)) {
            return [
                'peut_jouer' => false,
                'raison' => 'Ce jeu n\'est pas disponible actuellement'
            ];
        }

        // Vérifier la limite quotidienne
        if (!$jeu->peutEtreUtiliseParUtilisateur($userId)) {
            $essaisUtilises = $jeu->getUtilisationsAujourdhui($userId);
            return [
                'peut_jouer' => false,
                'raison' => "Vous avez utilisé tous vos essais pour aujourd'hui ({$essaisUtilises}/{$jeu->limite_utilisation})",
                'essais_restants' => 0
            ];
        }

        $essaisRestants = $jeu->utilisationsRestantesAujourdhui($userId);

        return [
            'peut_jouer' => true,
            'essais_restants' => $essaisRestants,
            'jeu' => $jeu
        ];
    }

    /**
     * Enregistrer une participation à un jeu
     */
    public function enregistrerParticipation($jeuId, $userId, $aGagne, $gain = null): array
    {
        $verification = $this->peutJouer($jeuId, $userId);

        if (!$verification['peut_jouer']) {
            throw new \Exception($verification['raison']);
        }

        $jeu = $verification['jeu'];

        return DB::transaction(function () use ($jeu, $userId, $aGagne, $gain) {
            $user = User::findOrFail($userId);

            // Enregistrer la participation
            $usage = UsagePromo::create([
                'id_evenement' => $jeu->id_evenement,
                'id_commande' => null,
                'id_utilisateur' => $userId,
                'montant_remise' => 0,
            ]);

            // Incrémenter le compteur global
            $jeu->increment('nombre_utilisation');

            // Calculer les essais restants APRÈS cette participation
            $essaisRestants = $jeu->utilisationsRestantesAujourdhui($userId);

            $resultat = [
                'success' => true,
                'a_gagne' => $aGagne,
                'essais_restants' => $essaisRestants,
                'peut_rejouer' => $essaisRestants > 0,
            ];

            // Si l'utilisateur a gagné
            if ($aGagne) {
                switch ($jeu->type_remise) {
                    case 'point_bonus':
                        $points = (int)($gain ?? $jeu->valeur_remise);
                        $user->increment('point_fidelite', $points);
                        
                        // Enregistrer dans l'historique des points
                        SuiviPoint::create([
                            'id_utilisateur' => $userId,
                            'variation_points' => $points,
                            'solde_apres' => $user->point_fidelite,
                            'source_points' => 'bonus',
                        ]);

                        $resultat['points_gagnes'] = $points;
                        $resultat['nouveau_solde'] = $user->point_fidelite;
                        $resultat['message'] = "🎉 Félicitations ! Vous avez gagné {$points} points de fidélité !";
                        break;

                    case 'fixe':
                        $montant = $gain ?? $jeu->valeur_remise;
                        $resultat['reduction'] = $montant;
                        $resultat['message'] = "🎉 Bravo ! Vous avez gagné une réduction de {$montant} FCFA !";
                        break;

                    case 'pourcentage':
                        $pourcentage = $gain ?? $jeu->valeur_remise;
                        $resultat['pourcentage'] = $pourcentage;
                        $resultat['message'] = "🎉 Super ! Vous avez gagné {$pourcentage}% de réduction !";
                        break;
                }
            } else {
                if ($essaisRestants > 0) {
                    $resultat['message'] = "😔 Dommage ! Il vous reste {$essaisRestants} essai(s) aujourd'hui.";
                } else {
                    $resultat['message'] = "😔 Dommage ! Revenez demain pour de nouveaux essais !";
                }
            }

            return $resultat;
        });
    }

    /**
     * Obtenir les statistiques d'un jeu
     */
    public function getStatistiques($jeuId): array
    {
        $jeu = Evenement::with('usagePromos')->findOrFail($jeuId);

        $participationsParJour = UsagePromo::where('id_evenement', $jeuId)
            ->selectRaw('DATE(date_utilisation) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        $participantsUniques = UsagePromo::where('id_evenement', $jeuId)
            ->distinct('id_utilisateur')
            ->count();

        return [
            'total_participations' => $jeu->nombre_utilisation,
            'participants_uniques' => $participantsUniques,
            'taux_participation' => $participantsUniques > 0 
                ? round(($jeu->nombre_utilisation / $participantsUniques), 2)
                : 0,
            'participations_par_jour' => $participationsParJour,
        ];
    }
}