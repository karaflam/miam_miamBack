<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // PostgreSQL : Modifier la contrainte CHECK pour ajouter 'utilisation_commande'
        DB::statement("
            ALTER TABLE suivi_points 
            DROP CONSTRAINT IF EXISTS suivi_points_source_points_check
        ");
        
        DB::statement("
            ALTER TABLE suivi_points 
            ADD CONSTRAINT suivi_points_source_points_check 
            CHECK (source_points IN ('commande', 'parrainage', 'bonus', 'annulation', 'utilisation_commande', 'achat'))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Retour à l'ancienne contrainte
        DB::statement("
            ALTER TABLE suivi_points 
            DROP CONSTRAINT IF EXISTS suivi_points_source_points_check
        ");
        
        DB::statement("
            ALTER TABLE suivi_points 
            ADD CONSTRAINT suivi_points_source_points_check 
            CHECK (source_points IN ('commande', 'parrainage', 'bonus', 'annulation'))
        ");
    }
};
