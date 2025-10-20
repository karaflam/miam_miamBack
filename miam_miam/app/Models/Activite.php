<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activite extends Model
{
    protected $table = 'activites';
    protected $primaryKey = 'id_activite';
    
    protected $fillable = [
        'id_utilisateur',
        'id_employe',
        'action',
        'module',
        'details',
        'adresse_ip',
    ];

    protected $casts = [
        'date_action' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }

    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_employe');
    }
}