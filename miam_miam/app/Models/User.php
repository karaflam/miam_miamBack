<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'users';
    protected $primaryKey = 'id_utilisateur';
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom', 'prenom', 'email', 'mot_de_passe', 'telephone',
        'localisation', 'code_parrainage', 'id_parrain', 'point_fidelite', 'statut'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'mot_de_passe' => 'hashed',
        ];
    }

    protected $casts = [
        'point_fidelite' => 'integer',
        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
    ];
    
    // Relations
    public function parrain() {
        return $this->belongsTo(User::class, 'id_parrain', 'id_utilisateur');
    }
    
    public function filleuls() {
        return $this->hasMany(User::class, 'id_parrain', 'id_utilisateur');
    }
    
    public function commandes() {
        return $this->hasMany(Commande::class, 'id_utilisateur');
    }

    public function paiements() {
        return $this->hasMany(Paiement::class, 'id_utilisateur');
    }

    public function parrainages() {
        return $this->hasMany(Parrainage::class, 'id_parrain');
    }
    
    public function suiviPoints() {
        return $this->hasMany(SuiviPoint::class, 'id_utilisateur');
    }

    public function consentement() {
        return $this->hasOne(Consentement::class, 'id_utilisateur');
    }
    
    
    public function reclamations() {
        return $this->hasMany(Reclamation::class, 'id_utilisateur');
    }

    public function activites() {
        return $this->hasMany(Activite::class, 'id_utilisateur');
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
