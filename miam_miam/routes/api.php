<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\FideliteController;
use App\Http\Controllers\Api\ParrainageController;

// Routes publiques
Route::prefix('menu')->group(function () {
    Route::get('/', [MenuController::class, 'index']);
});

// Webhook CinetPay (public, pas de auth)
Route::post('/cinetpay/notify', [PaiementController::class, 'notify']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    
    // Commandes
    Route::prefix('commandes')->group(function () {
        Route::post('/', [CommandeController::class, 'store']);
        Route::get('/mes-commandes', [CommandeController::class, 'index']);
        Route::get('/{id}', [CommandeController::class, 'show']);
    });
    
    // Paiements
    Route::prefix('paiement')->group(function () {
        Route::post('/initier', [PaiementController::class, 'initier']);
        Route::get('/verifier/{transactionId}', [PaiementController::class, 'verifier']);
    });
    
    // Fidélité
    Route::prefix('fidelite')->group(function () {
        Route::get('/solde', [FideliteController::class, 'solde']);
        Route::get('/historique', [FideliteController::class, 'historique']);
    });
    
    // Parrainage
    Route::prefix('parrainage')->group(function () {
        Route::get('/mon-code', [ParrainageController::class, 'monCode']);
        Route::get('/mes-filleuls', [ParrainageController::class, 'mesFilleuls']);
    });
    
    // Menu (admin uniquement)
    Route::middleware('role:admin,employe')->prefix('menu')->group(function () {
        Route::post('/', [MenuController::class, 'store']);
        Route::put('/{id}', [MenuController::class, 'update']);
        Route::delete('/{id}', [MenuController::class, 'destroy']);
    });
});