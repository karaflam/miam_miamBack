<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Commande extends Model
{
    protected $table = 'commandes';
    protected $primaryKey = 'id_commande';
    
    protected $fillable = [
        'id_utilisateur',
        'type_livraison',
        'heure_arrivee',
        'adresse_livraison',
        'statut_commande',
        'commentaire_client',
        'commentaire_livraison',
        'montant_total',
        'montant_remise',
        'montant_final',
        'points_utilises',
    ];

    protected $casts = [
        'heure_arrivee' => 'datetime:H:i',
        'montant_total' => 'decimal:2',
        'montant_remise' => 'decimal:2',
        'montant_final' => 'decimal:2',
        'points_utilises' => 'integer',
        'date_commande' => 'datetime',
        'date_mise_a_jour' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }

    public function detailsCommandes(): HasMany
    {
        return $this->hasMany(DetailCommande::class, 'id_commande');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'id_commande');
    }

    public function usagePromos(): HasMany
    {
        return $this->hasMany(UsagePromo::class, 'id_commande');
    }

    public function reclamations(): HasMany
    {
        return $this->hasMany(Reclamation::class, 'id_commande');
    }

    public function suiviPoints(): HasMany
    {
        return $this->hasMany(SuiviPoint::class, 'id_commande');
    }
}