<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Employe;
use App\Models\Commande;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Statistiques globales du dashboard admin
     */
    public function stats(): JsonResponse
    {
        try {
            // 1. Total des utilisateurs (étudiants + staff)
            $totalEtudiants = User::count();
            $totalStaff = Employe::count();
            $totalUtilisateurs = $totalEtudiants + $totalStaff;
            
            // Calculer le pourcentage de changement par rapport au mois dernier
            // Étudiants créés le mois dernier
            $etudiantsMoisDernier = User::whereMonth('created_at', Carbon::now()->subMonth()->month)
                ->whereYear('created_at', Carbon::now()->subMonth()->year)
                ->count();
            
            // Étudiants créés ce mois
            $etudiantsMoisActuel = User::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();
            
            // Staff créés le mois dernier
            $staffMoisDernier = Employe::whereMonth('date_creation', Carbon::now()->subMonth()->month)
                ->whereYear('date_creation', Carbon::now()->subMonth()->year)
                ->count();
            
            // Staff créés ce mois
            $staffMoisActuel = Employe::whereMonth('date_creation', Carbon::now()->month)
                ->whereYear('date_creation', Carbon::now()->year)
                ->count();
            
            $utilisateursMoisDernier = $etudiantsMoisDernier + $staffMoisDernier;
            $utilisateursMoisActuel = $etudiantsMoisActuel + $staffMoisActuel;
            
            $pourcentageUtilisateurs = $utilisateursMoisDernier > 0 
                ? round((($utilisateursMoisActuel - $utilisateursMoisDernier) / $utilisateursMoisDernier) * 100)
                : 0;

            // 2. Chiffre d'affaires total pour le mois en cours
            $chiffreAffaireMois = Commande::whereMonth('date_commande', Carbon::now()->month)
                ->whereYear('date_commande', Carbon::now()->year)
                ->where('statut_commande', '!=', 'annulee')
                ->sum('montant_final');

            // CA du mois dernier pour comparaison
            $chiffreAffaireMoisDernier = Commande::whereMonth('date_commande', Carbon::now()->subMonth()->month)
                ->whereYear('date_commande', Carbon::now()->subMonth()->year)
                ->where('statut_commande', '!=', 'annulee')
                ->sum('montant_final');

            $pourcentageCA = $chiffreAffaireMoisDernier > 0 
                ? round((($chiffreAffaireMois - $chiffreAffaireMoisDernier) / $chiffreAffaireMoisDernier) * 100)
                : 0;

            // 3. Nombre de commandes totales pour le mois en cours
            $commandesTotalesMois = Commande::whereMonth('date_commande', Carbon::now()->month)
                ->whereYear('date_commande', Carbon::now()->year)
                ->count();

            // Commandes du mois dernier pour comparaison
            $commandesMoisDernier = Commande::whereMonth('date_commande', Carbon::now()->subMonth()->month)
                ->whereYear('date_commande', Carbon::now()->subMonth()->year)
                ->count();

            $pourcentageCommandes = $commandesMoisDernier > 0 
                ? round((($commandesTotalesMois - $commandesMoisDernier) / $commandesMoisDernier) * 100)
                : 0;

            // 4. Nombre de plats disponibles en stock (quantité > 0)
            $platsActifs = Stock::where('quantite_disponible', '>', 0)->count();

            // Statut stable/en hausse/en baisse
            $platsActifsMoisDernier = Stock::where('quantite_disponible', '>', 0)
                ->whereMonth('date_mise_a_jour', Carbon::now()->subMonth()->month)
                ->count();
            
            $statutPlats = 'Stable';
            if ($platsActifs > $platsActifsMoisDernier) {
                $statutPlats = 'En hausse';
            } elseif ($platsActifs < $platsActifsMoisDernier) {
                $statutPlats = 'En baisse';
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'utilisateurs_totaux' => [
                        'total' => $totalUtilisateurs,
                        'variation' => $pourcentageUtilisateurs,
                        'label' => $pourcentageUtilisateurs >= 0 ? "+{$pourcentageUtilisateurs}% ce mois" : "{$pourcentageUtilisateurs}% ce mois"
                    ],
                    'chiffre_affaire_total' => [
                        'total' => $chiffreAffaireMois,
                        'variation' => $pourcentageCA,
                        'label' => $pourcentageCA >= 0 ? "+{$pourcentageCA}% ce mois" : "{$pourcentageCA}% ce mois"
                    ],
                    'commandes_totales' => [
                        'total' => $commandesTotalesMois,
                        'variation' => $pourcentageCommandes,
                        'label' => $pourcentageCommandes >= 0 ? "+{$pourcentageCommandes}% ce mois" : "{$pourcentageCommandes}% ce mois"
                    ],
                    'plats_actifs' => [
                        'total' => $platsActifs,
                        'statut' => $statutPlats
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Performance globale : CA et commandes par mois (6 derniers mois)
     */
    public function performanceGlobale(): JsonResponse
    {
        try {
            $performances = [];
            
            // Récupérer les données des 6 derniers mois
            for ($i = 5; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $mois = $date->locale('fr')->isoFormat('MMM');
                
                // Chiffre d'affaires du mois
                $ca = Commande::whereMonth('date_commande', $date->month)
                    ->whereYear('date_commande', $date->year)
                    ->where('statut_commande', '!=', 'annulee')
                    ->sum('montant_final');
                
                // Nombre de commandes du mois
                $commandes = Commande::whereMonth('date_commande', $date->month)
                    ->whereYear('date_commande', $date->year)
                    ->count();
                
                $performances[] = [
                    'mois' => ucfirst($mois),
                    'chiffre_affaire' => (float) $ca,
                    'commandes' => $commandes
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $performances
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des performances',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Répartition des utilisateurs par rôle
     */
    public function repartitionUtilisateurs(): JsonResponse
    {
        try {
            // Compter les étudiants (table users)
            $etudiants = User::count();
            
            // Compter le staff par rôle (table employes avec relation role)
            // On suppose que les rôles ont des noms comme 'employe', 'manager', 'administrateur'
            $employes = Employe::whereHas('role', function($query) {
                $query->whereIn('nom_role', ['employe', 'employee']);
            })->count();
            
            $managers = Employe::whereHas('role', function($query) {
                $query->whereIn('nom_role', ['manager', 'gerant']);
            })->count();
            
            $admins = Employe::whereHas('role', function($query) {
                $query->whereIn('nom_role', ['admin', 'administrateur']);
            })->count();

            $total = $etudiants + Employe::count(); // Total étudiants + staff

            // Log pour débogage
            Log::info('Répartition utilisateurs:', [
                'etudiants' => $etudiants,
                'employes' => $employes,
                'managers' => $managers,
                'admins' => $admins,
                'total' => $total
            ]);

            $data = [
                'etudiants' => [
                    'count' => $etudiants,
                    'percentage' => $total > 0 ? round(($etudiants / $total) * 100, 1) : 0
                ],
                'employes' => [
                    'count' => $employes,
                    'percentage' => $total > 0 ? round(($employes / $total) * 100, 1) : 0
                ],
                'managers' => [
                    'count' => $managers,
                    'percentage' => $total > 0 ? round(($managers / $total) * 100, 1) : 0
                ],
                'admins' => [
                    'count' => $admins,
                    'percentage' => $total > 0 ? round(($admins / $total) * 100, 1) : 0
                ],
                'total' => $total
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur répartition utilisateurs:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la répartition',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toutes les statistiques en une seule requête (optimisé)
     */
    public function all(): JsonResponse
    {
        try {
            // Appeler les 3 méthodes et récupérer les données
            $statsResponse = $this->stats();
            $performanceResponse = $this->performanceGlobale();
            $repartitionResponse = $this->repartitionUtilisateurs();

            Log::info('Réponses brutes:', [
                'stats_content' => $statsResponse->getContent(),
                'performance_content' => $performanceResponse->getContent(),
                'repartition_content' => $repartitionResponse->getContent()
            ]);

            // Décoder les réponses JSON
            $statsData = json_decode($statsResponse->getContent(), true);
            $performanceData = json_decode($performanceResponse->getContent(), true);
            $repartitionData = json_decode($repartitionResponse->getContent(), true);

            Log::info('Dashboard all() - Données décodées:', [
                'stats_success' => $statsData['success'] ?? false,
                'performance_success' => $performanceData['success'] ?? false,
                'repartition_success' => $repartitionData['success'] ?? false,
                'repartition_data' => $repartitionData['data'] ?? null,
                'repartition_full' => $repartitionData
            ]);

            $result = [
                'success' => true,
                'data' => [
                    'stats' => $statsData['data'] ?? null,
                    'performance_globale' => $performanceData['data'] ?? null,
                    'repartition_utilisateurs' => $repartitionData['data'] ?? null
                ]
            ];

            Log::info('Résultat final envoyé:', $result);

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Erreur dashboard all():', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données du dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Top 10 des clients (pour dashboard étudiant)
     * @param string $periode 'mois' ou 'semaine'
     */
    public function top10Clients(): JsonResponse
    {
        try {
            // Récupérer le paramètre de période (par défaut: mois)
            $periode = request()->get('periode', 'mois');
            
            $moisActuel = Carbon::now()->month;
            $anneeActuelle = Carbon::now()->year;
            
            // Construire la requête de base
            $query = User::select(
                'users.id_utilisateur',
                'users.nom',
                'users.prenom',
                'users.email',
                'users.point_fidelite',
                DB::raw('COALESCE(SUM(commandes.montant_final), 0) as total_depense'),
                DB::raw('COUNT(commandes.id_commande) as nombre_commandes')
            )
            ->leftJoin('commandes', 'users.id_utilisateur', '=', 'commandes.id_utilisateur')
            ->where('commandes.statut_commande', '!=', 'annulee');

            // Appliquer le filtre selon la période
            if ($periode === 'semaine') {
                // Semaine en cours (du lundi au dimanche)
                $debutSemaine = Carbon::now()->startOfWeek();
                $finSemaine = Carbon::now()->endOfWeek();
                
                $query->whereBetween('commandes.date_commande', [$debutSemaine, $finSemaine]);
                $periodeLabel = 'Semaine du ' . $debutSemaine->format('d/m') . ' au ' . $finSemaine->format('d/m/Y');
            } else {
                // Mois en cours (par défaut)
                $query->whereMonth('commandes.date_commande', $moisActuel)
                      ->whereYear('commandes.date_commande', $anneeActuelle);
                $periodeLabel = Carbon::now()->locale('fr')->translatedFormat('F Y');
            }

            // Récupérer les 10 meilleurs clients
            $topClients = $query
                ->groupBy('users.id_utilisateur', 'users.nom', 'users.prenom', 'users.email', 'users.point_fidelite')
                ->orderByDesc('total_depense')
                ->limit(10)
                ->get();

            // Ajouter le rang
            $topClients = $topClients->map(function($client, $index) {
                return [
                    'rang' => $index + 1,
                    'id' => $client->id_utilisateur,
                    'nom' => $client->nom,
                    'prenom' => $client->prenom,
                    'email' => $client->email,
                    'points_fidelite' => $client->point_fidelite ?? 0,
                    'total_depense' => (float) $client->total_depense,
                    'nombre_commandes' => (int) $client->nombre_commandes,
                    'nom_complet' => $client->prenom . ' ' . $client->nom
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'top_clients' => $topClients,
                    'periode' => $periodeLabel,
                    'type_periode' => $periode
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur top 10 clients:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du top 10',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
