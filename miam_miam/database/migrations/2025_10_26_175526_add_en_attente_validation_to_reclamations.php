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
        // Ajouter 'en_attente_validation' et 'valide' aux statuts possibles
        DB::statement("
            ALTER TABLE reclamations 
            DROP CONSTRAINT IF EXISTS reclamations_statut_check
        ");
        
        DB::statement("
            ALTER TABLE reclamations 
            ADD CONSTRAINT reclamations_statut_check 
            CHECK (statut IN ('ouvert', 'en_cours', 'en_attente_validation', 'valide', 'resolu', 'rejete'))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Retour à l'ancienne contrainte
        DB::statement("
            ALTER TABLE reclamations 
            DROP CONSTRAINT IF EXISTS reclamations_statut_check
        ");
        
        DB::statement("
            ALTER TABLE reclamations 
            ADD CONSTRAINT reclamations_statut_check 
            CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'rejete'))
        ");
    }
};
