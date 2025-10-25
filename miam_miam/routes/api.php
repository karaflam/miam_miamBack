<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StaffAuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\ReclamationController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\UsagePromoController;
use App\Http\Controllers\Api\FideliteController;
use App\Http\Controllers\Api\ParrainageController;
use App\Http\Controllers\Api\UserManagementController;

// Route test
Route::get('/test', function () {
    return response()->json(['message' => 'API fonctionne!']);
});

// Route de diagnostic (protégée par auth)
Route::middleware('auth:sanctum')->get('/diagnostic/auth', [App\Http\Controllers\Api\DiagnosticController::class, 'authDiagnostic']);

// Routes d'authentification publiques (utilisateurs/étudiants)
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Routes d'authentification staff (employés)
Route::post('/staff/login', [StaffAuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/staff/logout', [StaffAuthController::class, 'logout']);
    Route::get('/staff/user', [StaffAuthController::class, 'user']);
    
    // Profil staff
    Route::get('/staff/profile', [App\Http\Controllers\Api\StaffProfileController::class, 'show']);
    Route::put('/staff/profile', [App\Http\Controllers\Api\StaffProfileController::class, 'update']);
    Route::put('/staff/profile/password', [App\Http\Controllers\Api\StaffProfileController::class, 'updatePassword']);
});

// Routes publiques
Route::get('/menu', [MenuController::class, 'index']);

// Webhook CinetPay
Route::post('/cinetpay/notify', [PaiementController::class, 'notify']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    
    // Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'updatePassword']);
    });
    
    // Referral
    Route::prefix('referral')->group(function () {
        Route::get('/code', [ReferralController::class, 'getCode']);
        Route::get('/referrals', [ReferralController::class, 'getReferrals']);
    });
    
    // Commandes
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::get('/commandes/mes-commandes', [CommandeController::class, 'index']);
    Route::get('/commandes/{id}', [CommandeController::class, 'show']);
    
    // Réclamations
    Route::post('/reclamations', [ReclamationController::class, 'store']);
    Route::get('/reclamations/mes-reclamations', [ReclamationController::class, 'index']);
    Route::get('/reclamations/{id}', [ReclamationController::class, 'show']);
    Route::put('/reclamations/{id}/annuler', [ReclamationController::class, 'cancel']);
    
    // Paiements
    Route::post('/paiement/initier', [PaiementController::class, 'initier']);
    Route::get('/paiement/verifier/{transactionId}', [PaiementController::class, 'verifier']);
    
    // Menu admin
    Route::middleware('role:admin,employe')->group(function () {
        Route::post('/menu', [MenuController::class, 'store']);
        Route::put('/menu/{id}', [MenuController::class, 'update']);
        Route::delete('/menu/{id}', [MenuController::class, 'destroy']);
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
    
    // Statistiques
    Route::get('/statistiques/generales', [StatistiqueController::class, 'generales']);
    Route::get('/statistiques/journalieres', [StatistiqueController::class, 'journalieres']);
    Route::get('/statistiques/mensuelles', [StatistiqueController::class, 'mensuelles']);
    Route::get('/statistiques/hebdomadaires', [StatistiqueController::class, 'hebdomadaires']);
    Route::get('/statistiques/top-clients', [StatistiqueController::class, 'topClients']);
    // Vérifiez que la route pointe vers le bon contrôleur
    Route::get('/usage-promo', [App\Http\Controllers\Api\UsagePromoController::class, 'index']);
    
    // Gestion des utilisateurs (Admin/Staff uniquement)
    Route::middleware('role:admin,employe')->prefix('admin/users')->group(function () {
        Route::get('/', [UserManagementController::class, 'index']);
        Route::get('/statistics', [UserManagementController::class, 'statistics']);
        Route::get('/{id}', [UserManagementController::class, 'show']);
        Route::post('/', [UserManagementController::class, 'store']);
        Route::put('/{id}', [UserManagementController::class, 'update']);
        Route::delete('/{id}', [UserManagementController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [UserManagementController::class, 'toggleStatus']);
        Route::post('/{id}/reset-password', [UserManagementController::class, 'resetPassword']);
        Route::post('/{id}/activate', [UserManagementController::class, 'activate']);
        Route::post('/{id}/suspend', [UserManagementController::class, 'suspend']);
        Route::post('/{id}/adjust-points', [UserManagementController::class, 'adjustPoints']);
    });
});