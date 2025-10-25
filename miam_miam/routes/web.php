<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsagePromoController;
use App\Http\Controllers\Api\EvenementController;
use App\Http\Controllers\Api\StatistiqueController;

Route::get('/', function () {
    return view('frontend');
});
Route::middleware(['auth:sanctum'])->group(function () {
    // Routes CRUD de base
    Route::get('/usage-promos', [UsagePromoController::class, 'index']);
    Route::get('/usage-promos/{id}', [UsagePromoController::class, 'show']);
    Route::post('/usage-promos', [UsagePromoController::class, 'store']);
    Route::put('/usage-promos/{id}', [UsagePromoController::class, 'update']);
    Route::delete('/usage-promos/{id}', [UsagePromoController::class, 'destroy']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    // Routes publiques (étudiants)
    Route::get('/evenements', [EvenementController::class, 'index']);
    Route::get('/evenements/{id}', [EvenementController::class, 'show']);
    Route::post('/evenements/{id}/participer', [EvenementController::class, 'participer']);
    
    // Routes admin/manager seulement
    Route::middleware(['role:admin,manager'])->group(function () {
        Route::post('/evenements', [EvenementController::class, 'store']);
        Route::put('/evenements/{id}', [EvenementController::class, 'update']);
        Route::delete('/evenements/{id}', [EvenementController::class, 'destroy']);
        Route::patch('/evenements/{id}/toggle', [EvenementController::class, 'toggle']);
    });
});

// Routes pour les statistiques

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/statistiques/generales', [StatistiqueController::class, 'generales']);
    Route::get('/statistiques/journalieres', [StatistiqueController::class, 'journalieres']);
    Route::get('/statistiques/mensuelles', [StatistiqueController::class, 'mensuelles']);
    Route::get('/statistiques/hebdomadaires', [StatistiqueController::class, 'hebdomadaires']);
    Route::get('/statistiques/top-clients', [StatistiqueController::class, 'topClients']);
});
Route::get('/test', function () {
    return response()->json(['message' => 'API fonctionne!']);
});

// Fallback route pour le SPA React - doit être en dernier
// Toutes les routes non-API renvoient la vue frontend pour que React Router prenne le relais
Route::fallback(function () {
    return view('frontend');
});