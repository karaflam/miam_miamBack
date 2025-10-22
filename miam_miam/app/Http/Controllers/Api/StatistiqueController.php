<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatistiqueController extends Controller
{
    public function generales()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $stats = [
            'total_utilisateurs' => User::where('statut', 'actif')->count(),
            'total_commandes' => Commande::count(),
            'total_ventes' => Commande::where('statut_commande', 'validee')->sum('montant_final'),
            'commandes_aujourd_hui' => Commande::whereDate('date_commande', today())->count(),
        ];

        return response()->json($stats);
    }

    public function hebdomadaires()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $debutSemaine = Carbon::now()->startOfWeek();
        $finSemaine = Carbon::now()->endOfWeek();

        $stats = [
            'commandes_semaine' => Commande::whereBetween('date_commande', [$debutSemaine, $finSemaine])->count(),
            'ventes_semaine' => Commande::whereBetween('date_commande', [$debutSemaine, $finSemaine])
                ->where('statut_commande', 'validee')
                ->sum('montant_final'),
        ];

        return response()->json($stats);
    }

    public function topClients()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $topClients = User::select('users.*', DB::raw('COUNT(commandes.id_commande) as nombre_commandes'))
            ->leftJoin('commandes', 'users.id_utilisateur', '=', 'commandes.id_utilisateur')
            ->where('commandes.statut_commande', 'validee')
            ->groupBy('users.id_utilisateur')
            ->orderBy('nombre_commandes', 'desc')
            ->limit(10)
            ->get();

        return response()->json($topClients);
    }
}