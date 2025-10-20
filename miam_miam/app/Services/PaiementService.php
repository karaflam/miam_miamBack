<?php
namespace App\Services;

use CinetPay\CinetPay;
use Illuminate\Support\Facades\DB;
use App\Models\Paiement;
use App\Models\Commande;
use App\Models\SuiviPoint;

class PaiementService
{
    public function initierPaiement(Commande $commande, string $methodePaiement)
    {
        $cinetpay = new CinetPay(config('services.cinetpay.site_id'), config('services.cinetpay.api_key'));

        $transactionId = 'CMD-' . $commande->id_commande . '-' . time();

        $paiement = Paiement::create([
            'id_commande' => $commande->id_commande,
            'id_utilisateur' => $commande->id_utilisateur,
            'montant' => $commande->montant_final,
            'methode_paiement' => $methodePaiement,
            'identifiant_transaction' => $transactionId,
            'statut_paiement' => 'en_attente',
        ]);

        $payload = [
            'transaction_id' => $transactionId,
            'amount' => $commande->montant_final,
            'currency' => 'XAF',
            'description' => "Commande #" . $commande->id_commande,
            'return_url' => config('services.cinetpay.return_url'),
            'notify_url' => config('services.cinetpay.notify_url'),
            'customer_name' => $commande->utilisateur->nom ?? null,
            'customer_email' => $commande->utilisateur->email ?? null,
        ];

        // Tentative d'appels selon la version du SDK, sinon message d'erreur utile pour le debug
        if (method_exists($cinetpay, 'generatePaymentLink')) {
            $response = $cinetpay->generatePaymentLink($payload);
        } elseif (method_exists($cinetpay, 'generate')) {
            $response = $cinetpay->generate($payload);
        } elseif (method_exists($cinetpay, 'createPayment')) {
            $response = $cinetpay->createPayment($payload);
        } else {
            // lister méthodes disponibles pour aider le débogage
            $methods = get_class_methods($cinetpay);
            throw new \RuntimeException("Méthode pour générer le lien de paiement introuvable dans CinetPay SDK. Installez le bon package (composer require cinetpay/sdk) ou adaptez l'appel. Méthodes disponibles: " . implode(', ', $methods));
        }

        return [
            'paiement_id' => $paiement->id_paiement,
            'payment_url' => $response['data']['payment_url'] ?? ($response['payment_url'] ?? null),
            'transaction_id' => $transactionId,
            'raw_response' => $response,
        ];
    }

    public function verifierPaiement(string $transactionId)
    {
        $cinetpay = new CinetPay(config('services.cinetpay.site_id'), config('services.cinetpay.api_key'));
        return $cinetpay->getPayStatus($transactionId);
    }

    public function payerAvecPoints(Commande $commande, int $pointsUtilises)
    {
        $user = $commande->utilisateur;

        if ($user->point_fidelite < $pointsUtilises) {
            throw new \Exception('Points insuffisants');
        }

        $reduction = floor($pointsUtilises / 15) * 1000;
        $reduction = min($reduction, $commande->montant_total);

        DB::transaction(function () use ($user, $commande, $pointsUtilises, $reduction) {
            $user->decrement('point_fidelite', $pointsUtilises);

            SuiviPoint::create([
                'id_utilisateur' => $user->id_utilisateur,
                'id_commande' => $commande->id_commande,
                'variation_points' => -$pointsUtilises,
                'solde_apres' => $user->point_fidelite,
                'source_points' => 'commande',
            ]);

            $commande->update([
                'montant_remise' => $reduction,
                'montant_final' => $commande->montant_total - $reduction,
                'points_utilises' => $pointsUtilises,
            ]);
        });

        return $reduction;
    }
}
