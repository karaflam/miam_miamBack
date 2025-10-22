<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsagePromo extends Model
{
    protected $table = 'usage_promo';
    protected $primaryKey = 'id_usage';
    
    protected $fillable = [
        'id_evenement',
        'id_commande',
        'id_utilisateur',
        'montant_remise',
    ];

    protected $casts = [
        'montant_remise' => 'decimal:2',
        'date_utilisation' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function evenement(): BelongsTo
    {
        return $this->belongsTo(Evenement::class, 'id_evenement');
    }

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }
}