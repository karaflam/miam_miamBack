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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id('id_permission');
            $table->unsignedBigInteger('id_role');
            $table->string('nom_permission', 100);
            $table->text('description')->nullable();
            $table->enum('autorise', ['oui', 'non'])->default('non');
            
            // Clés étrangères
            $table->foreign('id_role')->references('id_role')->on('roles')->onDelete('cascade');
            
            // Contraintes
            $table->unique(['id_role', 'nom_permission']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};