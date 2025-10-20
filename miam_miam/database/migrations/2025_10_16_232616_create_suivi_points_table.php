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
        Schema::create('suivi_points', function (Blueprint $table) {
            $table->id('id_transaction');
            $table->unsignedBigInteger('id_utilisateur');
            $table->unsignedBigInteger('id_commande')->nullable();
            $table->unsignedBigInteger('id_parrainage')->nullable();
            $table->integer('variation_points');
            $table->integer('solde_apres');
            $table->enum('source_points', ['commande', 'parrainage', 'bonus', 'annulation']);
            $table->date('date_expiration')->nullable();
            $table->timestamp('date_enregistrement')->useCurrent();
            
            // Clés étrangères
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('users')->onDelete('cascade');
            $table->foreign('id_commande')->references('id_commande')->on('commandes')->onDelete('set null');
            $table->foreign('id_parrainage')->references('id_parrainage')->on('parrainages')->onDelete('set null');
            
            // Index
            $table->index('id_utilisateur');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suivi_points');
    }
};