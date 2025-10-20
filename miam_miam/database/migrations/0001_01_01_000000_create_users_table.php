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
        Schema::create('users', function (Blueprint $table) {
            $table->id('id_utilisateur');
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email', 100)->unique();
            $table->string('mot_de_passe', 255);
            $table->string('telephone', 15)->unique();
            $table->text('localisation')->nullable();
            $table->string('code_parrainage', 10)->unique();
            $table->unsignedBigInteger('id_parrain')->nullable();
            $table->integer('point_fidelite')->default(0);
            $table->enum('statut', ['actif', 'inactif'])->default('inactif');
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_modification')->useCurrent()->useCurrentOnUpdate();
            
            // Clés étrangères
            $table->foreign('id_parrain')->references('id_utilisateur')->on('users')->onDelete('set null');
            
            // Index
            $table->index('email');
            $table->index('code_parrainage');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
