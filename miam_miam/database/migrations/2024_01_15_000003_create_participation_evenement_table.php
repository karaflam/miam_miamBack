<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participation_evenement', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_etudiant');
            $table->unsignedBigInteger('id_evenement');
            $table->date('date_participation'); // Pour compter les participations par jour
            $table->timestamps();

            // Foreign keys
            $table->foreign('id_etudiant')->references('id_utilisateur')->on('users')->onDelete('cascade');
            $table->foreign('id_evenement')->references('id_evenement')->on('evenements')->onDelete('cascade');
            
            // Index pour optimiser les requêtes
            $table->index(['id_etudiant', 'id_evenement', 'date_participation']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participation_evenement');
    }
};
