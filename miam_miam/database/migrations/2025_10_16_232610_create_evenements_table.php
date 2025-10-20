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
        Schema::create('evenements', function (Blueprint $table) {
            $table->id('id_evenement');
            $table->string('code_promo', 40)->unique()->nullable();
            $table->string('titre', 100);
            $table->text('description')->nullable();
            $table->enum('type', ['promotion', 'jeu', 'evenement']);
            $table->enum('type_remise', ['pourcentage', 'fixe', 'point_bonus'])->nullable();
            $table->decimal('valeur_remise', 12, 2)->default(0);
            $table->string('url_affiche', 500)->nullable();
            $table->date('date_debut')->default(now());
            $table->date('date_fin');
            $table->enum('active', ['oui', 'non'])->default('oui');
            $table->integer('limite_utilisation')->default(0);
            $table->integer('nombre_utilisation')->default(0);
            $table->timestamp('date_creation')->useCurrent();
            
            // Index
            $table->index('code_promo');
            $table->index('active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evenements');
    }
};