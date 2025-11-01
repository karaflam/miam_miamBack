# 🏛️ Architecture Backend - Mon Miam Miam

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure MVC Laravel](#structure-mvc-laravel)
3. [Modèles Eloquent](#modèles-eloquent)
4. [Controllers](#controllers)
5. [Middleware](#middleware)
6. [Services](#services)
7. [Resources (Transformers)](#resources-transformers)
8. [Requests (Validation)](#requests-validation)
9. [Observers](#observers)
10. [Bonnes Pratiques](#bonnes-pratiques)

---

## 🎯 Vue d'ensemble

### Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Frontend)                    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP Requests (JSON)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Routes (api.php)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Middleware                           │
│  • CORS          • Auth (Sanctum)    • Role Check      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Controllers                           │
│  • Validation (FormRequest)                            │
│  • Business Logic (Services)                           │
│  • Response (Resources)                                │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌──────────┐
    │ Models  │ │Services │ │Resources │
    │(Eloquent)│ │         │ │(Transform)│
    └────┬────┘ └─────────┘ └──────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Database (MySQL)                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Structure MVC Laravel

### Arborescence Backend

```
app/
├── Console/
│   └── Kernel.php
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── StaffAuthController.php
│   │       ├── ProfileController.php
│   │       ├── CommandeController.php
│   │       ├── MenuController.php
│   │       ├── ReclamationController.php
│   │       ├── PaiementController.php
│   │       ├── EvenementController.php
│   │       ├── ReferralController.php
│   │       ├── FideliteController.php
│   │       ├── StatistiqueController.php
│   │       ├── DashboardController.php
│   │       └── UserManagementController.php
│   ├── Middleware/
│   │   ├── CheckRole.php
│   │   └── Authenticate.php
│   ├── Requests/
│   │   ├── Auth/
│   │   │   ├── LoginRequest.php
│   │   │   └── RegisterRequest.php
│   │   ├── Commande/
│   │   │   └── CreateCommandeRequest.php
│   │   ├── Menu/
│   │   │   ├── CreateMenuRequest.php
│   │   │   └── UpdateMenuRequest.php
│   │   └── ...
│   └── Resources/
│       ├── UserResource.php
│       ├── CommandeResource.php
│       ├── MenuResource.php
│       ├── ReclamationResource.php
│       └── EvenementResource.php
├── Models/
│   ├── User.php
│   ├── Employe.php
│   ├── Menu.php
│   ├── CategorieMenu.php
│   ├── Commande.php
│   ├── DetailCommande.php
│   ├── Paiement.php
│   ├── Reclamation.php
│   ├── Evenement.php
│   ├── Parrainage.php
│   ├── SuiviPoint.php
│   ├── Stock.php
│   ├── UsagePromo.php
│   └── Activite.php
├── Services/
│   ├── AuthService.php
│   ├── PaiementService.php
│   ├── FideliteService.php
│   ├── NotificationService.php
│   └── ImageService.php
├── Observers/
│   └── CommandeObserver.php
└── Providers/
    ├── AppServiceProvider.php
    └── RouteServiceProvider.php
```

---

## 📦 Modèles Eloquent

### 1. User Model

**Fichier** : `app/Models/User.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id_user';

    protected $fillable = [
        'nom', 'prenom', 'email', 'password', 
        'telephone', 'adresse', 'role', 
        'solde', 'points_fidelite', 'code_parrainage'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'solde' => 'decimal:2',
        'points_fidelite' => 'integer',
    ];

    // Relations
    public function commandes()
    {
        return $this->hasMany(Commande::class, 'id_user');
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class, 'id_user');
    }

    public function reclamations()
    {
        return $this->hasMany(Reclamation::class, 'id_user');
    }

    public function suiviPoints()
    {
        return $this->hasMany(SuiviPoint::class, 'id_user')
                    ->orderBy('date_transaction', 'desc');
    }

    public function parrainages()
    {
        return $this->hasMany(Parrainage::class, 'id_parrain');
    }

    // Accessors
    public function getNomCompletAttribute()
    {
        return "{$this->prenom} {$this->nom}";
    }

    // Scopes
    public function scopeStudent($query)
    {
        return $query->where('role', 'student');
    }

    public function scopeActive($query)
    {
        return $query->whereNotNull('email_verified_at');
    }
}
```

---

### 2. Commande Model

**Fichier** : `app/Models/Commande.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $table = 'commandes';
    protected $primaryKey = 'id_commande';

    protected $fillable = [
        'numero_commande', 'id_user', 'date_commande',
        'montant_total', 'statut', 'type_livraison',
        'heure_arrivee', 'adresse_livraison', 'commentaire_client'
    ];

    protected $casts = [
        'date_commande' => 'datetime',
        'montant_total' => 'decimal:2',
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function details()
    {
        return $this->hasMany(DetailCommande::class, 'id_commande');
    }

    public function paiement()
    {
        return $this->hasOne(Paiement::class, 'id_commande');
    }

    // Scopes
    public function scopeEnCours($query)
    {
        return $query->whereIn('statut', ['en_attente', 'en_preparation']);
    }

    public function scopeAujourdhui($query)
    {
        return $query->whereDate('date_commande', today());
    }

    // Méthodes
    public static function genererNumeroCommande()
    {
        $lastId = static::max('id_commande') ?? 0;
        return 'CMD-' . date('Ymd') . '-' . str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
    }
}
```

---

### 3. Menu Model

**Fichier** : `app/Models/Menu.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $table = 'menus';
    protected $primaryKey = 'id_article';

    protected $fillable = [
        'nom', 'description', 'prix', 'image',
        'id_categorie', 'disponible', 'temps_preparation',
        'valeur_nutritionnelle', 'ingredients'
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'disponible' => 'boolean',
        'temps_preparation' => 'integer',
    ];

    protected $appends = ['image_url'];

    // Relations
    public function categorie()
    {
        return $this->belongsTo(CategorieMenu::class, 'id_categorie');
    }

    public function stock()
    {
        return $this->hasOne(Stock::class, 'id_article');
    }

    // Accessors
    public function getImageUrlAttribute()
    {
        return $this->image 
            ? url('storage/' . $this->image)
            : null;
    }

    // Scopes
    public function scopeDisponible($query)
    {
        return $query->where('disponible', true);
    }

    public function scopeParCategorie($query, $categorieId)
    {
        return $query->where('id_categorie', $categorieId);
    }
}
```

---

### 4. Evenement Model

**Fichier** : `app/Models/Evenement.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evenement extends Model
{
    protected $table = 'evenements';
    protected $primaryKey = 'id_evenement';

    protected $fillable = [
        'titre', 'description', 'type', 'code_promo',
        'valeur_remise', 'type_remise', 'date_debut',
        'date_fin', 'active', 'affiche', 'recompense_points'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'valeur_remise' => 'decimal:2',
        'recompense_points' => 'integer',
    ];

    protected $appends = ['url_affiche', 'est_actif'];

    // Accessors
    public function getUrlAfficheAttribute()
    {
        return $this->affiche 
            ? url('storage/' . $this->affiche)
            : null;
    }

    public function getEstActifAttribute()
    {
        $now = now()->format('Y-m-d');
        return $this->active === 'oui' 
            && $this->date_debut <= $now 
            && $this->date_fin >= $now;
    }

    // Scopes
    public function scopeActif($query)
    {
        return $query->where('active', 'oui')
                     ->where('date_debut', '<=', now())
                     ->where('date_fin', '>=', now());
    }

    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }
}
```

---

## 🎮 Controllers

### Structure d'un Controller

**Exemple** : `CommandeController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Commande\CreateCommandeRequest;
use App\Http\Resources\CommandeResource;
use App\Models\Commande;
use App\Models\DetailCommande;
use App\Services\FideliteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    protected $fideliteService;

    public function __construct(FideliteService $fideliteService)
    {
        $this->fideliteService = $fideliteService;
    }

    /**
     * Liste des commandes de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $commandes = Commande::where('id_user', auth()->id())
            ->with(['details.article', 'paiement'])
            ->when($request->statut, function($q) use ($request) {
                $q->where('statut', $request->statut);
            })
            ->orderBy('date_commande', 'desc')
            ->get();

        return CommandeResource::collection($commandes);
    }

    /**
     * Créer une nouvelle commande
     */
    public function store(CreateCommandeRequest $request)
    {
        DB::beginTransaction();
        
        try {
            // Créer la commande
            $commande = Commande::create([
                'numero_commande' => Commande::genererNumeroCommande(),
                'id_user' => auth()->id(),
                'montant_total' => $this->calculerMontantTotal($request->articles),
                'statut' => 'en_attente',
                'type_livraison' => $request->type_livraison,
                'heure_arrivee' => $request->heure_arrivee,
                'adresse_livraison' => $request->adresse_livraison,
                'commentaire_client' => $request->commentaire_client,
            ]);

            // Ajouter les articles
            foreach ($request->articles as $article) {
                DetailCommande::create([
                    'id_commande' => $commande->id_commande,
                    'id_article' => $article['id'],
                    'quantite' => $article['quantite'],
                    'prix_unitaire' => $article['prix'],
                    'sous_total' => $article['prix'] * $article['quantite'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Commande créée avec succès',
                'data' => new CommandeResource($commande->load('details.article'))
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Détails d'une commande
     */
    public function show($id)
    {
        $commande = Commande::with(['details.article', 'paiement', 'user'])
            ->findOrFail($id);

        // Vérifier que l'utilisateur est propriétaire ou staff
        if ($commande->id_user !== auth()->id() && !in_array(auth()->user()->role, ['employee', 'manager', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        return new CommandeResource($commande);
    }

    /**
     * Mettre à jour le statut (Staff uniquement)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:en_attente,en_preparation,prete,livree,annulee'
        ]);

        $commande = Commande::findOrFail($id);
        $commande->update(['statut' => $request->statut]);

        // Si livrée, attribuer points de fidélité
        if ($request->statut === 'livree') {
            $this->fideliteService->attribuerPointsCommande($commande);
        }

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour',
            'data' => new CommandeResource($commande)
        ]);
    }

    private function calculerMontantTotal($articles)
    {
        return collect($articles)->sum(function($article) {
            return $article['prix'] * $article['quantite'];
        });
    }
}
```

---

## 🛡️ Middleware

### CheckRole Middleware

**Fichier** : `app/Http/Middleware/CheckRole.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!auth()->check()) {
            return response()->json([
                'message' => 'Non authentifié'
            ], 401);
        }

        $userRole = auth()->user()->role;

        if (!in_array($userRole, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        return $next($request);
    }
}
```

**Enregistrement** : `app/Http/Kernel.php`

```php
protected $middlewareAliases = [
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

**Utilisation** :

```php
Route::middleware('role:admin,manager')->group(function () {
    Route::get('/admin/stats', [DashboardController::class, 'stats']);
});
```

---

## 🔧 Services

### FideliteService

**Fichier** : `app/Services/FideliteService.php`

```php
<?php

namespace App\Services;

use App\Models\SuiviPoint;
use App\Models\User;
use App\Models\Commande;

class FideliteService
{
    /**
     * Règle : 1000 FCFA = 1 point
     */
    const RATIO_POINTS = 1000;

    /**
     * Attribuer des points après une commande livrée
     */
    public function attribuerPointsCommande(Commande $commande)
    {
        $points = floor($commande->montant_total / self::RATIO_POINTS);

        if ($points > 0) {
            $user = $commande->user;
            $user->increment('points_fidelite', $points);

            SuiviPoint::create([
                'id_user' => $user->id_user,
                'type_transaction' => 'gain',
                'points' => $points,
                'source' => 'commande',
                'description' => "Points gagnés pour la commande {$commande->numero_commande}",
                'id_reference' => $commande->id_commande,
            ]);
        }

        return $points;
    }

    /**
     * Utiliser des points pour une réduction
     */
    public function utiliserPoints(User $user, int $points, string $description = null)
    {
        if ($user->points_fidelite < $points) {
            throw new \Exception('Points insuffisants');
        }

        $user->decrement('points_fidelite', $points);

        SuiviPoint::create([
            'id_user' => $user->id_user,
            'type_transaction' => 'utilisation',
            'points' => -$points,
            'source' => 'reduction',
            'description' => $description ?? 'Utilisation de points',
        ]);

        return true;
    }

    /**
     * Attribuer points de parrainage
     */
    public function attribuerPointsParrainage(User $parrain, User $filleul)
    {
        // Points pour le parrain
        $parrain->increment('points_fidelite', 50);
        SuiviPoint::create([
            'id_user' => $parrain->id_user,
            'type_transaction' => 'gain',
            'points' => 50,
            'source' => 'parrainage',
            'description' => "Parrainage de {$filleul->nom_complet}",
        ]);

        // Points pour le filleul
        $filleul->increment('points_fidelite', 25);
        SuiviPoint::create([
            'id_user' => $filleul->id_user,
            'type_transaction' => 'gain',
            'points' => 25,
            'source' => 'parrainage',
            'description' => "Bonus d'inscription avec code parrain",
        ]);
    }
}
```

---

## 📤 Resources (Transformers)

### CommandeResource

**Fichier** : `app/Http/Resources/CommandeResource.php`

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CommandeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id_commande' => $this->id_commande,
            'numero_commande' => $this->numero_commande,
            'date_commande' => $this->date_commande->format('Y-m-d H:i:s'),
            'montant_total' => (float) $this->montant_total,
            'statut' => $this->statut,
            'type_livraison' => $this->type_livraison,
            'heure_arrivee' => $this->heure_arrivee,
            'adresse_livraison' => $this->adresse_livraison,
            'commentaire_client' => $this->commentaire_client,
            
            // Relations
            'articles' => DetailCommandeResource::collection($this->whenLoaded('details')),
            'paiement' => new PaiementResource($this->whenLoaded('paiement')),
            'client' => $this->when(
                $request->user()->role !== 'student',
                new UserResource($this->whenLoaded('user'))
            ),
            
            // Statistiques
            'articles_count' => $this->details->count(),
            
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
```

---

## ✅ Requests (Validation)

### CreateCommandeRequest

**Fichier** : `app/Http/Requests/Commande/CreateCommandeRequest.php`

```php
<?php

namespace App\Http\Requests\Commande;

use Illuminate\Foundation\Http\FormRequest;

class CreateCommandeRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'type_livraison' => 'required|in:livraison,sur_place',
            'heure_arrivee' => 'required|date_format:H:i',
            'adresse_livraison' => 'required_if:type_livraison,livraison|string|max:500',
            'commentaire_client' => 'nullable|string|max:1000',
            'articles' => 'required|array|min:1',
            'articles.*.id' => 'required|exists:menus,id_article',
            'articles.*.prix' => 'required|numeric|min:0',
            'articles.*.quantite' => 'required|integer|min:1|max:50',
        ];
    }

    public function messages()
    {
        return [
            'type_livraison.required' => 'Le type de livraison est requis',
            'articles.required' => 'Au moins un article est requis',
            'articles.*.id.exists' => 'Article invalide',
        ];
    }
}
```

---

## 👁️ Observers

### CommandeObserver

**Fichier** : `app/Observers/CommandeObserver.php`

```php
<?php

namespace App\Observers;

use App\Models\Commande;
use App\Services\NotificationService;

class CommandeObserver
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function created(Commande $commande)
    {
        // Notifier les employés d'une nouvelle commande
        $this->notificationService->notifierNouvelleCommande($commande);
    }

    public function updated(Commande $commande)
    {
        // Si statut changé, notifier le client
        if ($commande->isDirty('statut')) {
            $this->notificationService->notifierChangementStatut($commande);
        }
    }
}
```

**Enregistrement** : `app/Providers/AppServiceProvider.php`

```php
use App\Models\Commande;
use App\Observers\CommandeObserver;

public function boot()
{
    Commande::observe(CommandeObserver::class);
}
```

---

## 💎 Bonnes Pratiques

### 1. Utiliser les Form Requests

❌ **Mauvais** :
```php
public function store(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email',
        // ...
    ]);
}
```

✅ **Bon** :
```php
public function store(CreateUserRequest $request)
{
    // Validation déjà faite
    $validated = $request->validated();
}
```

---

### 2. Utiliser les Resources

❌ **Mauvais** :
```php
return response()->json($user);
```

✅ **Bon** :
```php
return new UserResource($user);
```

---

### 3. Transactions DB

```php
DB::beginTransaction();
try {
    // Opérations
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

---

### 4. Eager Loading

❌ **Mauvais (N+1 queries)** :
```php
$commandes = Commande::all();
foreach ($commandes as $commande) {
    echo $commande->user->nom; // Query pour chaque itération
}
```

✅ **Bon** :
```php
$commandes = Commande::with('user')->get();
```

---

### 5. Scopes Réutilisables

```php
// Model
public function scopeActif($query) {
    return $query->where('active', true);
}

// Utilisation
Menu::disponible()->actif()->get();
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2024
