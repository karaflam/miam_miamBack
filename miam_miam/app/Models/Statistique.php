<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Statistique extends Model
{
    protected $table = 'statistiques';
    
    protected $fillable = [
        'type_statistique',
        'valeur',
        'periode',
        'date_statistique'
    ];

    protected $casts = [
        'date_statistique' => 'datetime',
        'valeur' => 'decimal:2'
    ];
}


