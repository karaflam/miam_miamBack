<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Parrainage extends Model
{
    protected $table = 'parrainages';
    protected $primaryKey = 'id_parrainage';
    
    protected $fillable = [
        'id_parrain',
        'id_filleul',
        'recompense_attribuee',
        'points_recompense',
        'date_premiere_commande',
        'date_recompense',
    ];

    protected $casts = [
        'points_recompense' => 'integer',
        'date_parrainage' => 'datetime',
        'date_premiere_commande' => 'datetime',
        'date_recompense' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function parrain(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_parrain');
    }

    public function filleul(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_filleul');
    }

    public function suiviPoints(): HasMany
    {
        return $this->hasMany(SuiviPoint::class, 'id_parrainage');
    }
}