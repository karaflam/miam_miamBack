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
        Schema::create('consentements', function (Blueprint $table) {
            $table->id('id_consentement');
            $table->unsignedBigInteger('id_utilisateur');
            $table->enum('consentement_cookies', ['oui', 'non']);
            $table->string('version_document', 20)->default('1.0');
            $table->timestamp('date_consentement')->useCurrent();
            
            // Clés étrangères
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consentements');
    }
};