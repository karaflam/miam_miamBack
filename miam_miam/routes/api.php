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
Route::get('/menu/{id}', [MenuController::class, 'show']);
Route::get('/categories', [App\Http\Controllers\Api\CategorieMenuController::class, 'index']);
Route::get('/categories/{id}', [App\Http\Controllers\Api\CategorieMenuController::class, 'show']);

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
    
    // Debug (à retirer en production)
    Route::get('/debug/whoami', [App\Http\Controllers\Api\DebugController::class, 'whoami']);
    
    // Commandes (utilisateurs)
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::get('/commandes/mes-commandes', [CommandeController::class, 'index']);
    Route::get('/commandes/{id}', [CommandeController::class, 'show']);
    
    // Commandes (staff uniquement)
    Route::middleware('role:admin,employe,manager')->prefix('staff/commandes')->group(function () {
        Route::get('/', [CommandeController::class, 'all']);
        Route::put('/{id}/status', [CommandeController::class, 'updateStatus']);
    });
    
    // Réclamations (utilisateurs)
    Route::post('/reclamations', [ReclamationController::class, 'store']);
    Route::get('/reclamations/mes-reclamations', [ReclamationController::class, 'index']);
    Route::get('/reclamations/{id}', [ReclamationController::class, 'show']);
    
    // Réclamations (staff uniquement)
    Route::middleware('role:admin,employe,manager')->prefix('staff/reclamations')->group(function () {
        Route::get('/', [ReclamationController::class, 'getAllReclamations']);
        Route::get('/statistics', [ReclamationController::class, 'statistics']);
        Route::post('/{id}/assign', [ReclamationController::class, 'assign']);
        Route::put('/{id}/status', [ReclamationController::class, 'updateStatus']);
    });
    
    // Paiements
    Route::post('/paiement/initier', [PaiementController::class, 'initier']);
    Route::get('/paiement/verifier/{transactionId}', [PaiementController::class, 'verifier']);
    Route::post('/paiement/recharger', [PaiementController::class, 'recharger']);
    
    // Menu admin
    Route::middleware('role:admin,employe,manager')->group(function () {
        Route::post('/menu', [MenuController::class, 'store']);
        Route::put('/menu/{id}', [MenuController::class, 'update']);
        Route::delete('/menu/{id}', [MenuController::class, 'destroy']);
        Route::post('/menu/{id}/toggle-disponibilite', [MenuController::class, 'toggleDisponibilite']);
        
        // Gestion du stock
        Route::put('/stock/{id_article}', [App\Http\Controllers\Api\StockController::class, 'update']);
        Route::post('/stock/{id_article}/adjust', [App\Http\Controllers\Api\StockController::class, 'adjust']);
        Route::get('/stock/ruptures', [App\Http\Controllers\Api\StockController::class, 'ruptures']);
        Route::get('/stock/alertes', [App\Http\Controllers\Api\StockController::class, 'alertes']);
    });

    // Fidélité
    Route::prefix('fidelite')->group(function () {
        Route::get('/solde', [FideliteController::class, 'solde']);
        Route::get('/historique', [FideliteController::class, 'historique']);
    });
    
    // Points de jeux (Blackjack, Quiz)
    Route::post('/student/points/add', [FideliteController::class, 'addPoints']);
    
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
    Route::middleware('role:admin,employe,manager')->prefix('admin/users')->group(function () {
        Route::get('/', [UserManagementController::class, 'index']);
        Route::get('/statistics', [UserManagementController::class, 'statistics']);
        Route::get('/{id}', [UserManagementController::class, 'show']);
        Route::post('/', [UserManagementController::class, 'store']);
        Route::put('/{id}', [UserManagementController::class, 'update']);
        Route::delete('/{id}', [UserManagementController::class, 'destroy']);
        Route::post('/{id}/reset-password', [UserManagementController::class, 'resetPassword']);
        Route::post('/{id}/activate', [UserManagementController::class, 'activate']);
        Route::post('/{id}/suspend', [UserManagementController::class, 'suspend']);
        Route::post('/{id}/adjust-points', [UserManagementController::class, 'adjustPoints']);
    });
});