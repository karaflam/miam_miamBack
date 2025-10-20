<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'limite_utilisation',
        'nombre_utilisation',
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
}