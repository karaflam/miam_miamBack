<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Evenement extends Model
{
    protected $table = 'evenements';
    protected $primaryKey = 'id_evenement';
    
    protected $fillable = [
        'code_promo',
        'titre',
        'description',
        'type',
        'type_remise',
        'valeur_remise',
        'url_affiche',
        'date_debut',
        'date_fin',
        'active',
        'limite_utilisation', // Pour les jeux: nombre max d'essais PAR JOUR PAR UTILISATEUR
        'nombre_utilisation', // Compteur global total
    ];

    protected $casts = [
        'valeur_remise' => 'decimal:2',
        'date_debut' => 'date',
        'date_fin' => 'date',
        'limite_utilisation' => 'integer',
        'nombre_utilisation' => 'integer',
        'date_creation' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function usagePromos(): HasMany
    {
        return $this->hasMany(UsagePromo::class, 'id_evenement');
    }

    /**
     * Scopes
     */
    public function scopeActif($query)
    {
        return $query->where('active', 'oui')
                    ->where('date_debut', '<=', now())
                    ->where('date_fin', '>=', now());
    }

    public function scopeJeux($query)
    {
        return $query->where('type', 'jeu');
    }

    public function scopePromotions($query)
    {
        return $query->where('type', 'promotion');
    }

    /**
     * Vérifier si l'utilisateur peut utiliser ce jeu aujourd'hui
     * Pour les JEUX: limite_utilisation = nombre d'essais par jour par utilisateur
     * Pour les PROMOS: limite_utilisation = nombre total d'utilisations du code
     */
    public function peutEtreUtiliseParUtilisateur($userId): bool
    {
        if ($this->type === 'jeu') {
            // Pour les jeux: limite quotidienne par utilisateur
            if ($this->limite_utilisation == 0) {
                return true; // Illimité
            }

            $utilisationsAujourdhui = UsagePromo::where('id_evenement', $this->id_evenement)
                ->where('id_utilisateur', $userId)
                ->whereDate('date_utilisation', Carbon::today())
                ->count();

            return $utilisationsAujourdhui < $this->limite_utilisation;
        } else {
            // Pour les promos: limite globale
            if ($this->limite_utilisation == 0) {
                return true; // Illimité
            }

            return $this->nombre_utilisation < $this->limite_utilisation;
        }
    }

    /**
     * Obtenir le nombre d'utilisations restantes aujourd'hui pour un utilisateur
     */
    public function utilisationsRestantesAujourdhui($userId): int
    {
        if ($this->type === 'jeu') {
            if ($this->limite_utilisation == 0) {
                return PHP_INT_MAX; // Illimité
            }

            $utilisationsAujourdhui = UsagePromo::where('id_evenement', $this->id_evenement)
                ->where('id_utilisateur', $userId)
                ->whereDate('date_utilisation', Carbon::today())
                ->count();

            return max(0, $this->limite_utilisation - $utilisationsAujourdhui);
        }

        return 0;
    }

    /**
     * Obtenir les utilisations d'aujourd'hui pour un utilisateur
     */
    public function getUtilisationsAujourdhui($userId): int
    {
        return UsagePromo::where('id_evenement', $this->id_evenement)
            ->where('id_utilisateur', $userId)
            ->whereDate('date_utilisation', Carbon::today())
            ->count();
    }
}