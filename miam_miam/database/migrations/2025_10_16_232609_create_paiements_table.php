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
        Schema::create('paiements', function (Blueprint $table) {
            $table->id('id_paiement');
            $table->unsignedBigInteger('id_commande');
            $table->unsignedBigInteger('id_utilisateur');
            $table->decimal('montant', 12, 2);
            $table->enum('methode_paiement', ['carte_bancaire', 'mobile_money', 'points_fidelite', 'espece']);
            $table->string('identifiant_transaction', 100)->unique()->nullable();
            $table->enum('statut_paiement', ['reussi', 'en_attente', 'echoue'])->default('en_attente');
            $table->timestamp('date_paiement')->useCurrent();
            
            // Clés étrangères
            $table->foreign('id_commande')->references('id_commande')->on('commandes')->onDelete('restrict');
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('users')->onDelete('restrict');
            
            // Index
            $table->index('id_commande');
            $table->index('id_utilisateur');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};