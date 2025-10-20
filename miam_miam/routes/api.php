<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MenuController;


Route::prefix('menu')->group(function () {
    Route::get('/', [MenuController::class, 'index']);  // Public
    Route::get('/categories', [MenuController::class, 'categories']);
    
    Route::middleware('auth:sanctum', 'role:admin,employe')->group(function () {
        Route::post('/', [MenuController::class, 'store']);
        Route::put('/{id}', [MenuController::class, 'update']);
        Route::put('/{id}/disponibilite', [MenuController::class, 'toggleDisponibilite']);
        Route::delete('/{id}', [MenuController::class, 'destroy']);
    });
});
