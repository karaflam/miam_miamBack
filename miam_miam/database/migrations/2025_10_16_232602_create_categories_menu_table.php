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
        Schema::create('categories_menu', function (Blueprint $table) {
            $table->id('id_categorie');
            $table->string('nom_categorie', 60)->unique();
            $table->text('description')->nullable();
            $table->timestamp('date_creation')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories_menu');
    }
};