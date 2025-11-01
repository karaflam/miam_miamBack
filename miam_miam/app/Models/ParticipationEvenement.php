<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParticipationEvenement extends Model
{
    protected $table = 'participation_evenement';
    
    protected $fillable = [
        'id_etudiant',
        'id_evenement',
        'date_participation'
    ];

    protected $casts = [
        'date_participation' => 'date'
    ];

    // Relations
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class, 'id_etudiant', 'id_etudiant');
    }

    public function evenement()
    {
        return $this->belongsTo(Evenement::class, 'id_evenement', 'id_evenement');
    }
}
