<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailCommande extends Model
{
    protected $table = 'details_commandes';
    protected $primaryKey = 'id_detail';
    
    protected $fillable = [
        'id_commande',
        'id_article',
        'prix_unitaire',
        'quantite',
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'quantite' => 'integer',
        'sous_total' => 'decimal:2',
        'date_creation' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'id_article');
    }
}