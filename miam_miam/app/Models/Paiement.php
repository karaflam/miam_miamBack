<?php

namespace App\Models;
use App\Models\Utilisateur;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    protected $table = 'paiements';
    protected $primaryKey = 'id_paiement';
    
    protected $fillable = [
        'id_commande',
        'id_utilisateur',
        'montant',
        'methode_paiement',
        'identifiant_transaction',
        'statut_paiement',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_paiement' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }
}