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
        Schema::create('activites', function (Blueprint $table) {
            $table->id('id_activite');
            $table->unsignedBigInteger('id_utilisateur')->nullable();
            $table->unsignedBigInteger('id_employe')->nullable();
            $table->string('action', 100);
            $table->string('module', 50)->nullable();
            $table->text('details')->nullable();
            $table->string('adresse_ip', 45)->nullable();
            $table->timestamp('date_action')->useCurrent();
            
            // Clés étrangères
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('users')->onDelete('cascade');
            $table->foreign('id_employe')->references('id_employe')->on('employes')->onDelete('cascade');
            
            // Index
            $table->index('id_utilisateur');
            $table->index('id_employe');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activites');
    }
};