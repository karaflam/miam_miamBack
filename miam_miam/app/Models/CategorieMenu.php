<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategorieMenu extends Model
{
    protected $table = 'categories_menu';
    protected $primaryKey = 'id_categorie';
    
    protected $fillable = [
        'nom_categorie',
        'description',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class, 'id_categorie');
    }
}