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
        Schema::create('commandes', function (Blueprint $table) {
            $table->id('id_commande');
            $table->unsignedBigInteger('id_utilisateur');
            $table->enum('type_livraison', ['sur_place', 'livraison']);
            $table->time('heure_arrivee')->nullable();
            $table->text('adresse_livraison')->nullable();
            $table->enum('statut_commande', ['en_attente', 'validee', 'en_preparation', 'prete', 'livree', 'annulee'])->default('en_attente');
            $table->text('commentaire_client')->nullable();
            $table->text('commentaire_livraison')->nullable();
            $table->decimal('montant_total', 12, 2)->default(0);
            $table->decimal('montant_remise', 12, 2)->default(0);
            $table->decimal('montant_final', 12, 2)->default(0);
            $table->integer('points_utilises')->default(0);
            $table->timestamp('date_commande')->useCurrent();
            $table->timestamp('date_mise_a_jour')->useCurrent()->useCurrentOnUpdate();
            
            // Clés étrangères
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('users')->onDelete('restrict');
            
            // Index
            $table->index('id_utilisateur');
            $table->index('date_commande');
            $table->index('statut_commande');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};