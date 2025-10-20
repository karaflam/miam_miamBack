<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reclamation extends Model
{
    protected $table = 'reclamations';
    protected $primaryKey = 'id_reclamation';
    
    protected $fillable = [
        'id_utilisateur',
        'id_commande',
        'id_employe_assigne',
        'sujet',
        'description',
        'statut',
        'date_cloture',
        'commentaire_resolution',
    ];

    protected $casts = [
        'date_ouverture' => 'datetime',
        'date_cloture' => 'datetime',
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

    public function employeAssigne(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_employe_assigne');
    }
}