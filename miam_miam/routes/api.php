<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\UsagePromoController;
// Route test
Route::get('/test', function () {
    return response()->json(['message' => 'API fonctionne!']);
});

// Routes publiques
Route::get('/menu', [MenuController::class, 'index']);

// Webhook CinetPay
Route::post('/cinetpay/notify', [PaiementController::class, 'notify']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    
    // Commandes
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::get('/commandes/mes-commandes', [CommandeController::class, 'index']);
    Route::get('/commandes/{id}', [CommandeController::class, 'show']);
    
    // Paiements
    Route::post('/paiement/initier', [PaiementController::class, 'initier']);
    Route::get('/paiement/verifier/{transactionId}', [PaiementController::class, 'verifier']);
    
    // Menu admin
    Route::middleware('role:admin,employe')->group(function () {
        Route::post('/menu', [MenuController::class, 'store']);
        Route::put('/menu/{id}', [MenuController::class, 'update']);
        Route::delete('/menu/{id}', [MenuController::class, 'destroy']);
    });
    
    // Statistiques
    Route::get('/statistiques/generales', [StatistiqueController::class, 'generales']);
    Route::get('/statistiques/journalieres', [StatistiqueController::class, 'journalieres']);
    Route::get('/statistiques/mensuelles', [StatistiqueController::class, 'mensuelles']);
    Route::get('/statistiques/hebdomadaires', [StatistiqueController::class, 'hebdomadaires']);
    Route::get('/statistiques/top-clients', [StatistiqueController::class, 'topClients']);
    // Vérifiez que la route pointe vers le bon contrôleur
Route::get('/usage-promo', [App\Http\Controllers\Api\UsagePromoController::class, 'index']);
});