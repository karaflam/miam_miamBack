<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuiviPoint extends Model
{
    protected $table = 'suivi_points';
    protected $primaryKey = 'id_transaction';
    
    protected $fillable = [
        'id_utilisateur',
        'id_commande',
        'id_parrainage',
        'variation_points',
        'solde_apres',
        'source_points',
        'date_expiration',
    ];

    protected $casts = [
        'variation_points' => 'integer',
        'solde_apres' => 'integer',
        'date_expiration' => 'date',
        'date_enregistrement' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }

    public function parrainage(): BelongsTo
    {
        return $this->belongsTo(Parrainage::class, 'id_parrainage');
    }
}