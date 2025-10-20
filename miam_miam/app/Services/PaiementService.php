<?php
namespace App\Services;

use CinetPay\CinetPay;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Paiement;
use App\Models\Commande;
use App\Models\SuiviPoint;

class PaiementService
{
    private $cinetpay;

    public function __construct()
    {
        $this->cinetpay = new CinetPay(
            config('services.cinetpay.site_id'),
            config('services.cinetpay.api_key')
        );
    }

    public function initierPaiement(Commande $commande, string $methodePaiement)
    {
        try {
            $transactionId = 'CMD-' . $commande->id_commande . '-' . time();

            // Créer l'enregistrement de paiement
            $paiement = Paiement::create([
                'id_commande' => $commande->id_commande,
                'id_utilisateur' => $commande->id_utilisateur,
                'montant' => $commande->montant_final,
                'methode_paiement' => $methodePaiement,
                'identifiant_transaction' => $transactionId,
                'statut_paiement' => 'en_attente',
            ]);

            // Préparer les données pour CinetPay
            $this->cinetpay
                ->setTransId($transactionId)
                ->setAmount($commande->montant_final)
                ->setCurrency('XAF') // ou XOF selon votre zone
                ->setDescription("Commande #" . $commande->id_commande)
                ->setCustomer(
                    $commande->utilisateur->nom ?? 'Client',
                    $commande->utilisateur->prenom ?? ''
                )
                ->setNotifyUrl(config('services.cinetpay.notify_url'))
                ->setReturnUrl(config('services.cinetpay.return_url'))
                ->setCancelUrl(config('services.cinetpay.cancel_url'))
                ->setChannels('ALL');

            // Ajouter email si disponible
            if ($commande->utilisateur->email) {
                $this->cinetpay->setCustomerEmail($commande->utilisateur->email);
            }

            // Ajouter téléphone si disponible
            if ($commande->utilisateur->telephone) {
                $this->cinetpay->setCustomerPhoneNumber($commande->utilisateur->telephone);
            }

            // Générer le lien de paiement
            $response = $this->cinetpay->generatePaymentLink();

            Log::info('CinetPay Response:', $response);

            if (isset($response['code']) && $response['code'] == '201') {
                return [
                    'success' => true,
                    'paiement_id' => $paiement->id_paiement,
                    'payment_url' => $response['data']['payment_url'],
                    'payment_token' => $response['data']['payment_token'],
                    'transaction_id' => $transactionId,
                ];
            }

            throw new \Exception($response['message'] ?? 'Erreur lors de la génération du lien de paiement');

        } catch (\Exception $e) {
            Log::error('Erreur initiation paiement CinetPay: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function verifierPaiement(string $transactionId)
    {
        try {
            $this->cinetpay->setTransId($transactionId);
            $response = $this->cinetpay->getPayStatus();

            Log::info('CinetPay Status Check:', $response);

            return [
                'success' => true,
                'status' => $response['data']['status'] ?? 'PENDING',
                'data' => $response['data'] ?? []
            ];
        } catch (\Exception $e) {
            Log::error('Erreur vérification paiement: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function payerAvecPoints(Commande $commande, int $pointsUtilises)
    {
        $user = $commande->utilisateur;

        if ($user->point_fidelite < $pointsUtilises) {
            throw new \Exception('Points de fidélité insuffisants');
        }

        // 15 points = 1000 FCFA
        $reduction = floor($pointsUtilises / 15) * 1000;
        $reduction = min($reduction, $commande->montant_total);

        DB::transaction(function () use ($user, $commande, $pointsUtilises, $reduction) {
            // Déduire les points
            $user->decrement('point_fidelite', $pointsUtilises);

            // Enregistrer l'historique
            SuiviPoint::create([
                'id_utilisateur' => $user->id_utilisateur,
                'id_commande' => $commande->id_commande,
                'variation_points' => -$pointsUtilises,
                'solde_apres' => $user->point_fidelite,
                'source_points' => 'commande',
            ]);

            // Mettre à jour la commande
            $commande->update([
                'montant_remise' => $reduction,
                'montant_final' => $commande->montant_total - $reduction,
                'points_utilises' => $pointsUtilises,
            ]);

            // Créer un paiement validé
            Paiement::create([
                'id_commande' => $commande->id_commande,
                'id_utilisateur' => $user->id_utilisateur,
                'montant' => $commande->montant_final,
                'methode_paiement' => 'points_fidelite',
                'identifiant_transaction' => 'POINTS-' . $commande->id_commande . '-' . time(),
                'statut_paiement' => 'reussi',
            ]);
        });

        return [
            'success' => true,
            'reduction' => $reduction,
            'nouveau_solde' => $user->fresh()->point_fidelite
        ];
    }
}