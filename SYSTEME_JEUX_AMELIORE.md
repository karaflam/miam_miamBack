# 🎮 Système de jeux amélioré - Blackjack & Quiz

## 📋 Vue d'ensemble des modifications

### ✅ Blackjack
- Maximum de 10 tours par partie
- Objectif : Atteindre 500£
- Système de points de fidélité :
  - **2 points** si 500£ atteints en ≤ 5 tours
  - **1 point** si 500£ atteints en ≤ 10 tours
- Synchronisation automatique avec le backend

### ✅ Quiz
- Banque de 50 questions
- 10 questions aléatoires par partie
- Système de points de fidélité :
  - **2 points** si score > 5/10
  - **1 point** si score = 5/10
  - **0 point** si score < 5/10
- Plus de poids par question
- Synchronisation automatique avec le backend

---

## 🃏 Blackjack - Détails des modifications

### 1. Nouveau système de tours

```typescript
interface GameState {
  solde: number;
  mise: number;
  victoiresConsecutives: number;
  nombreTours: number;  // ← NOUVEAU
  pointsFidelite: number;  // ← NOUVEAU
  // ...
}
```

**Fonctionnement :**
- Compteur de tours initialisé à 0
- Incrémenté à chaque nouvelle mise
- Maximum : 10 tours
- Affichage : `Tours: X/10`

### 2. Système de points de fidélité

```typescript
// Si atteint 500£ avant 5 tours → 2 points
if (nouveauSolde >= 500 && gameState.nombreTours <= 5) {
  pointsFideliteGagnes = 2;
  message += ' 🎉 500£ en moins de 5 tours! +2 points de fidélité!';
}
// Si atteint au moins 500£ en 10 tours → 1 point
else if (nouveauSolde >= 500 && gameState.nombreTours <= 10) {
  pointsFideliteGagnes = 1;
  message += ' 👍 500£ atteints! +1 point de fidélité!';
}
```

**Règles :**
- Objectif : Atteindre 500£
- ≤ 5 tours = **2 points** 🎉
- 6-10 tours = **1 point** 👍
- > 10 tours ou < 500£ = **0 point**
- La partie s'arrête automatiquement à 500£

### 3. Synchronisation backend

```typescript
const synchroniserPointsFidelite = async (points: number) => {
  const response = await fetch('http://localhost:8000/api/student/points/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      points: points,
      source: 'blackjack'
    })
  });
};
```

**Endpoint attendu :** `POST /api/student/points/add`

**Payload :**
```json
{
  "points": 2,
  "source": "blackjack"
}
```

### 4. Affichage mis à jour

```jsx
<div className="game-info">
  <div className="info-item">
    <div>Solde</div>
    <div className="info-value">{gameState.solde}€</div>
  </div>
  <div className="info-item">
    <div>Tours</div>
    <div className="info-value">{gameState.nombreTours}/10</div>
  </div>
  <div className="info-item">
    <div>Points Fidélité</div>
    <div className="info-value">{gameState.pointsFidelite}</div>
  </div>
</div>
```

**Indicateurs visuels :**
- Solde ≥ 500£ → Message de succès vert
- Tours ≥ 5 et solde < 500£ → Avertissement

---

## 📚 Quiz - Détails des modifications

### 1. Banque de 50 questions

**Fichier :** `QuizQuestions.ts`

```typescript
export const questionBank: Question[] = [
  // 50 questions sur la cuisine sénégalaise
  {
    id: 1,
    question: "Quel est l'ingrédient principal du thiéboudienne ?",
    options: ["Poulet", "Poisson", "Bœuf", "Mouton"],
    correctAnswer: 1
  },
  // ... 49 autres questions
];
```

**Thèmes couverts :**
- Plats traditionnels (thiéboudienne, yassa, mafé, etc.)
- Boissons (bissap, bouye, café Touba, etc.)
- Ingrédients et épices
- Desserts et accompagnements
- Culture culinaire sénégalaise

### 2. Sélection aléatoire de 10 questions

```typescript
export const getRandomQuestions = (count: number = 10): Question[] => {
  const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
```

**Utilisation :**
```typescript
const [quizState, setQuizState] = useState<QuizState>(() => ({
  // ...
  questions: getRandomQuestions(10)  // 10 questions aléatoires
}));
```

**Avantages :**
- Chaque partie est différente
- 50 questions disponibles
- Seulement 10 questions par partie
- Mélange aléatoire à chaque restart

### 3. Nouveau système de points

```typescript
// Quiz terminé, calculer les points
const finalScore = quizState.score + (quizState.isCorrect ? 1 : 0);
let pointsFidelite = 0;

if (finalScore > 5) {
  pointsFidelite = 2;  // Plus de 5/10
} else if (finalScore === 5) {
  pointsFidelite = 1;  // Exactement 5/10
}
```

**Règles :**
- Score > 5/10 = **2 points** 🎉
- Score = 5/10 = **1 point** 👍
- Score < 5/10 = **0 point** 📚

**Suppression :**
- ❌ Plus de poids par question
- ❌ Plus de système de points cumulatifs
- ✅ Système simplifié basé sur le score final

### 4. Synchronisation backend

```typescript
const synchroniserPointsFidelite = async (points: number, score: number) => {
  const response = await fetch('http://localhost:8000/api/student/points/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      points: points,
      source: 'quiz',
      score: score
    })
  });
};
```

**Endpoint attendu :** `POST /api/student/points/add`

**Payload :**
```json
{
  "points": 2,
  "source": "quiz",
  "score": 7
}
```

### 5. Affichage mis à jour

**Pendant le quiz :**
```jsx
<span className="current-score">
  Score: {quizState.score}/10
</span>
```

**Écran de fin :**
```jsx
<div className="score-item highlight">
  <span className="score-label">Points de fidélité gagnés</span>
  <span className="score-value">+{pointsFidelite} pts</span>
</div>

<div className="completion-message">
  {quizState.score > 5 && "Excellent ! +2 points 🌟"}
  {quizState.score === 5 && "Bien joué ! +1 point 👨‍🍳"}
  {quizState.score < 5 && "Pas mal ! Venez goûter nos plats ! 🍽️"}
</div>
```

---

## 🔌 Backend - Routes à créer

### Route pour ajouter des points

**Fichier :** `routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/student/points/add', [PointsController::class, 'addPoints']);
});
```

**Controller :** `PointsController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PointsController extends Controller
{
    public function addPoints(Request $request)
    {
        $request->validate([
            'points' => 'required|integer|min:0',
            'source' => 'required|string|in:blackjack,quiz',
            'score' => 'nullable|integer'
        ]);

        $user = Auth::user();
        
        // Ajouter les points au compte de l'utilisateur
        $user->points_fidelite += $request->points;
        $user->save();

        // Optionnel : Logger l'activité
        \Log::info('Points ajoutés', [
            'user_id' => $user->id,
            'points' => $request->points,
            'source' => $request->source,
            'score' => $request->score,
            'total_points' => $user->points_fidelite
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Points ajoutés avec succès',
            'total_points' => $user->points_fidelite
        ]);
    }
}
```

**Migration (si nécessaire) :**

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('points_fidelite')->default(0)->after('email');
});
```

---

## 📊 Comparaison Avant/Après

### Blackjack

| Aspect | Avant | Après |
|--------|-------|-------|
| **Tours** | Illimités | Maximum 10 |
| **Objectif** | Aucun | Atteindre 500£ |
| **Points** | Système complexe avec As | Simple : basé sur objectif |
| **Récompenses** | 3 victoires + As = Triple | 500£ en ≤5 tours = 2 pts |
| **Fin de partie** | Solde = 0 | Solde = 0 OU 500£ OU 10 tours |

### Quiz

| Aspect | Avant | Après |
|--------|-------|-------|
| **Questions** | 10 fixes | 50 en banque, 10 aléatoires |
| **Poids** | 2-3 points par question | Aucun poids |
| **Récompenses** | Points cumulatifs | Basé sur score final |
| **Calcul** | Somme des points | > 5 = 2pts, = 5 = 1pt |
| **Variété** | Toujours les mêmes | Différent à chaque partie |

---

## 🧪 Tests recommandés

### Blackjack

**Test 1 : Gagner 2 points**
1. Jouer et atteindre 500£ en 5 tours ou moins
2. Vérifier le message "+2 points de fidélité"
3. Vérifier la synchronisation backend

**Test 2 : Gagner 1 point**
1. Jouer et atteindre 500£ entre 6 et 10 tours
2. Vérifier le message "+1 point de fidélité"
3. Vérifier la synchronisation backend

**Test 3 : Maximum de tours**
1. Jouer 10 tours sans atteindre 500£
2. Vérifier que le 11ème tour est bloqué
3. Vérifier le message "Maximum de 10 tours atteint"

### Quiz

**Test 1 : Gagner 2 points**
1. Répondre correctement à 6+ questions
2. Vérifier "+2 points de fidélité"
3. Vérifier la synchronisation backend

**Test 2 : Gagner 1 point**
1. Répondre correctement à exactement 5 questions
2. Vérifier "+1 point de fidélité"
3. Vérifier la synchronisation backend

**Test 3 : Questions aléatoires**
1. Terminer un quiz
2. Cliquer sur "Recommencer"
3. Vérifier que les questions sont différentes

---

## 📝 Fichiers modifiés

### Frontend

1. **Blackjack.tsx**
   - Ajout de `nombreTours` et `pointsFidelite` au state
   - Logique de limitation à 10 tours
   - Nouveau système de points de fidélité
   - Fonction de synchronisation backend
   - Affichage mis à jour

2. **QuizQuestions.ts** (NOUVEAU)
   - Banque de 50 questions
   - Fonction `getRandomQuestions()`

3. **CulinaryQuiz.tsx**
   - Import de `QuizQuestions`
   - Sélection de 10 questions aléatoires
   - Suppression du système de poids
   - Nouveau calcul de points de fidélité
   - Fonction de synchronisation backend
   - Affichage mis à jour

### Backend (à créer)

1. **PointsController.php**
   - Méthode `addPoints()`
   - Validation des données
   - Mise à jour des points utilisateur

2. **routes/api.php**
   - Route `POST /api/student/points/add`

3. **Migration** (si nécessaire)
   - Ajout colonne `points_fidelite` dans `users`

---

## ✅ Checklist de déploiement

### Frontend
- [x] Blackjack : Système de tours implémenté
- [x] Blackjack : Objectif 500£ implémenté
- [x] Blackjack : Points de fidélité implémentés
- [x] Blackjack : Synchronisation backend implémentée
- [x] Quiz : Banque de 50 questions créée
- [x] Quiz : Sélection aléatoire implémentée
- [x] Quiz : Nouveau système de points implémenté
- [x] Quiz : Synchronisation backend implémentée

### Backend
- [ ] Route `/api/student/points/add` créée
- [ ] Controller `PointsController` créé
- [ ] Migration `points_fidelite` exécutée
- [ ] Tests API effectués

### Tests
- [ ] Blackjack : Test 2 points
- [ ] Blackjack : Test 1 point
- [ ] Blackjack : Test maximum tours
- [ ] Quiz : Test 2 points
- [ ] Quiz : Test 1 point
- [ ] Quiz : Test questions aléatoires

---

## 🎯 Résumé

**Blackjack :**
- ✅ Maximum 10 tours
- ✅ Objectif : 500£
- ✅ 2 points si ≤ 5 tours
- ✅ 1 point si ≤ 10 tours
- ✅ Synchronisation backend

**Quiz :**
- ✅ 50 questions en banque
- ✅ 10 questions aléatoires par partie
- ✅ 2 points si > 5/10
- ✅ 1 point si = 5/10
- ✅ Plus de poids par question
- ✅ Synchronisation backend

**Les deux jeux sont maintenant synchronisés avec le backend ! 🎉**
