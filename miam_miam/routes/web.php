<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsagePromoController;
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

// Les routes événements ont été déplacées vers routes/api.php

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