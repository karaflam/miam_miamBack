<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'id_role';
    
    protected $fillable = [
        'nom_role',
        'description',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function employes(): HasMany
    {
        return $this->hasMany(Employe::class, 'id_role');
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(Permission::class, 'id_role');
    }
}