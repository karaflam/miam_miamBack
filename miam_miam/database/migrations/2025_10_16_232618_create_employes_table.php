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
        Schema::create('employes', function (Blueprint $table) {
            $table->id('id_employe');
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email', 100)->unique();
            $table->string('telephone', 15)->nullable();
            $table->unsignedBigInteger('id_role');
            $table->string('mot_de_passe', 255);
            $table->enum('actif', ['oui', 'non'])->default('oui');
            $table->date('date_embauche')->default(now());
            $table->timestamp('date_creation')->useCurrent();
            $table->unsignedBigInteger('id_createur')->nullable();
            
            // Clés étrangères
            $table->foreign('id_role')->references('id_role')->on('roles')->onDelete('restrict');
            $table->foreign('id_createur')->references('id_employe')->on('employes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employes');
    }
};