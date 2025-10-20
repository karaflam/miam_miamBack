<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Menu extends Model
{
    protected $table = 'menus';
    protected $primaryKey = 'id_article';
    
    protected $fillable = [
        'id_categorie',
        'nom_article',
        'description',
        'prix',
        'disponible',
        'temps_preparation',
        'url_image',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'temps_preparation' => 'integer',
        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function categorie(): BelongsTo
    {
        return $this->belongsTo(CategorieMenu::class, 'id_categorie');
    }

    public function detailsCommandes(): HasMany
    {
        return $this->hasMany(DetailCommande::class, 'id_article');
    }

    public function stock(): HasOne
    {
        return $this->hasOne(Stock::class, 'id_article');
    }
}