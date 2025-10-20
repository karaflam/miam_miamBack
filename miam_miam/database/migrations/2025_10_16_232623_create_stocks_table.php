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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id('id_stock');
            $table->unsignedBigInteger('id_article')->unique();
            $table->integer('quantite_disponible');
            $table->integer('seuil_alerte');
            $table->timestamp('date_mise_a_jour')->useCurrent()->useCurrentOnUpdate();
            
            // Clés étrangères
            $table->foreign('id_article')->references('id_article')->on('menus')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};