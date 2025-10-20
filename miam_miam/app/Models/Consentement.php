<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consentement extends Model
{
    protected $table = 'consentements';
    protected $primaryKey = 'id_consentement';
    
    protected $fillable = [
        'id_utilisateur',
        'consentement_cookies',
        'version_document',
    ];

    protected $casts = [
        'date_consentement' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }
}