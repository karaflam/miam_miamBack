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
        Schema::create('menus', function (Blueprint $table) {
            $table->id('id_article');
            $table->unsignedBigInteger('id_categorie');
            $table->string('nom_article', 100);
            $table->text('description')->nullable();
            $table->decimal('prix', 12, 2);
            $table->enum('disponible', ['oui', 'non'])->default('oui');
            $table->integer('temps_preparation')->nullable()->comment('Durée en minutes');
            $table->string('url_image', 500)->nullable();
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_modification')->useCurrent()->useCurrentOnUpdate();
            
            // Clés étrangères
            $table->foreign('id_categorie')->references('id_categorie')->on('categories_menu')->onDelete('restrict');
            
            // Index
            $table->index('id_categorie');
            $table->index('disponible');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};