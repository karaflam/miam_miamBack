<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Permission extends Model
{
    protected $table = 'permissions';
    protected $primaryKey = 'id_permission';
    
    protected $fillable = [
        'id_role',
        'nom_permission',
        'description',
        'autorise',
    ];

    public $timestamps = false;

    /**
     * Relations
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'id_role');
    }
}