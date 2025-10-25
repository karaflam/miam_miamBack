<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Employe extends Authenticatable
{
    use HasApiTokens;
    protected $table = 'employes';
    protected $primaryKey = 'id_employe';
    
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'id_role',
        'mot_de_passe',
        'actif',
        'date_embauche',
        'id_createur',
    ];

    protected $casts = [
        'date_embauche' => 'date',
        'date_creation' => 'datetime',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'id_role');
    }

    public function createur(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_createur');
    }

    public function employesCrees(): HasMany
    {
        return $this->hasMany(Employe::class, 'id_createur');
    }

    public function reclamations(): HasMany
    {
        return $this->hasMany(Reclamation::class, 'id_employe_assigne');
    }

    public function activites(): HasMany
    {
        return $this->hasMany(Activite::class, 'id_employe');
    }

    /**
     * Get the password for the user.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }
}