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
        Schema::create('parrainages', function (Blueprint $table) {
            $table->id('id_parrainage');
            $table->unsignedBigInteger('id_parrain');
            $table->unsignedBigInteger('id_filleul');
            $table->enum('recompense_attribuee', ['oui', 'non'])->default('non');
            $table->integer('points_recompense')->default(0);
            $table->timestamp('date_parrainage')->useCurrent();
            $table->timestamp('date_premiere_commande')->nullable();
            $table->timestamp('date_recompense')->nullable();
            
            // Clés étrangères
            $table->foreign('id_parrain')->references('id_utilisateur')->on('users')->onDelete('cascade');
            $table->foreign('id_filleul')->references('id_utilisateur')->on('users')->onDelete('cascade');
            
            // Contraintes
            $table->unique(['id_parrain', 'id_filleul']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parrainages');
    }
};