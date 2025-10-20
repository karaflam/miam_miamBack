<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    protected $table = 'stocks';
    protected $primaryKey = 'id_stock';
    
    protected $fillable = [
        'id_article',
        'quantite_disponible',
        'seuil_alerte',
    ];

    protected $casts = [
        'quantite_disponible' => 'integer',
        'seuil_alerte' => 'integer',
        'date_mise_a_jour' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'id_article');
    }
}