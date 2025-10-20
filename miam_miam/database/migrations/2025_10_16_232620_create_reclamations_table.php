<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reclamations', function (Blueprint $table) {
            $table->id('id_reclamation');
            $table->unsignedBigInteger('id_utilisateur');
            $table->unsignedBigInteger('id_commande')->nullable();
            $table->unsignedBigInteger('id_employe_assigne')->nullable();
            $table->string('sujet', 150);
            $table->text('description');
            $table->enum('statut', ['ouvert', 'en_cours', 'resolu', 'rejete'])->default('ouvert');
            $table->timestamp('date_ouverture')->useCurrent();
            $table->timestamp('date_cloture')->nullable();
            $table->text('commentaire_resolution')->nullable();
            
            // Clés étrangères
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('users')->onDelete('cascade');
            $table->foreign('id_commande')->references('id_commande')->on('commandes')->onDelete('set null');
            $table->foreign('id_employe_assigne')->references('id_employe')->on('employes')->onDelete('set null');
            
            // Index
            $table->index('id_utilisateur');
            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reclamations');
    }
};