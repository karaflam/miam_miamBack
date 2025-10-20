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
        Schema::create('usage_promo', function (Blueprint $table) {
            $table->id('id_usage');
            $table->unsignedBigInteger('id_evenement');
            $table->unsignedBigInteger('id_commande');
            $table->unsignedBigInteger('id_utilisateur');
            $table->decimal('montant_remise', 12, 2);
            $table->timestamp('date_utilisation')->useCurrent();
            
            // Clés étrangères
            $table->foreign('id_evenement')->references('id_evenement')->on('evenements')->onDelete('cascade');
            $table->foreign('id_commande')->references('id_commande')->on('commandes')->onDelete('cascade');
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('users')->onDelete('cascade');
            
            // Contraintes
            $table->unique(['id_commande', 'id_evenement']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usage_promo');
    }
};