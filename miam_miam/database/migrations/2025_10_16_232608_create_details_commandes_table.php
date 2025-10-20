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
        Schema::create('details_commandes', function (Blueprint $table) {
            $table->id('id_detail');
            $table->unsignedBigInteger('id_commande');
            $table->unsignedBigInteger('id_article');
            $table->decimal('prix_unitaire', 12, 2);
            $table->integer('quantite');
            $table->decimal('sous_total', 12, 2)->storedAs('prix_unitaire * quantite');
            $table->timestamp('date_creation')->useCurrent();
            
            // Clés étrangères
            $table->foreign('id_commande')->references('id_commande')->on('commandes')->onDelete('cascade');
            $table->foreign('id_article')->references('id_article')->on('menus')->onDelete('restrict');
            
            // Contraintes
            $table->unique(['id_commande', 'id_article']);
            
            // Index
            $table->index('id_commande');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('details_commandes');
    }
};