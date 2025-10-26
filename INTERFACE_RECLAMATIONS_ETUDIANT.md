# ✅ Interface de réclamations - Dashboard Étudiant

## Fonctionnalités implémentées

### 1. Bouton "Signaler un problème" dans l'historique

**Emplacement :** Historique des commandes → Chaque carte de commande

**Apparence :**
- Bouton orange avec icône `AlertCircle`
- Pleine largeur en bas de chaque commande
- Texte : "Signaler un problème"

**Action :** Ouvre une modal de création de réclamation avec la commande pré-sélectionnée

### 2. Onglet "Réclamations"

**Emplacement :** Navigation principale du dashboard

**Contenu :**
- Liste de toutes les réclamations de l'étudiant
- Affichage du statut avec badge coloré
- Date de création
- Numéro de commande associée
- Description du problème
- Résolution (si disponible)

**États d'affichage :**
- **Chargement** : Spinner avec message
- **Vide** : Icône + message "Aucune réclamation"
- **Liste** : Cartes de réclamations

### 3. Modal de création de réclamation

**Champs du formulaire :**
1. **Commande concernée** (affichée en haut, non modifiable)
2. **Sujet** (max 150 caractères)
   - Compteur de caractères
3. **Description détaillée** (textarea)

**Boutons :**
- **Annuler** : Ferme la modal et réinitialise les champs
- **Envoyer** : Soumet la réclamation (désactivé si champs vides)

**États :**
- Bouton désactivé pendant l'envoi
- Spinner pendant l'envoi
- Message de succès/erreur après soumission

## Codes couleur des statuts

| Statut | Badge | Couleur |
|--------|-------|---------|
| Ouverte | 🔴 | Rouge (`bg-red-100 text-red-800`) |
| En cours | 🟡 | Jaune (`bg-yellow-100 text-yellow-800`) |
| En attente de validation | 🟠 | Orange (`bg-orange-100 text-orange-800`) |
| Validée | 🟢 | Vert (`bg-green-100 text-green-800`) |
| Résolue | 🔵 | Bleu (`bg-blue-100 text-blue-800`) |
| Rejetée | ⚫ | Gris (`bg-gray-100 text-gray-800`) |

## Flux utilisateur

### Créer une réclamation

```
1. Étudiant va dans "Historique"
   ↓
2. Clique sur "Signaler un problème" sur une commande
   ↓
3. Modal s'ouvre avec la commande pré-remplie
   ↓
4. Remplit le sujet et la description
   ↓
5. Clique sur "Envoyer la réclamation"
   ↓
6. API POST /api/reclamations
   ↓
7. Message de succès
   ↓
8. Modal se ferme
   ↓
9. Réclamations rechargées automatiquement
```

### Consulter ses réclamations

```
1. Étudiant va dans l'onglet "Réclamations"
   ↓
2. API GET /api/reclamations/mes-reclamations
   ↓
3. Liste affichée avec statuts colorés
   ↓
4. Si résolution disponible → Affichée en vert
```

## États et fonctions ajoutés

### États React

```javascript
const [reclamations, setReclamations] = useState([])
const [isLoadingReclamations, setIsLoadingReclamations] = useState(false)
const [showReclamationModal, setShowReclamationModal] = useState(false)
const [selectedCommandeForReclamation, setSelectedCommandeForReclamation] = useState(null)
const [reclamationSubject, setReclamationSubject] = useState("")
const [reclamationDescription, setReclamationDescription] = useState("")
const [isSubmittingReclamation, setIsSubmittingReclamation] = useState(false)
```

### Fonctions

1. **`fetchReclamations()`**
   - Charge toutes les réclamations de l'utilisateur
   - Appelée quand l'onglet "reclamations" est actif

2. **`openReclamationModal(commande)`**
   - Ouvre la modal avec la commande sélectionnée
   - Réinitialise les champs du formulaire

3. **`handleSubmitReclamation()`**
   - Valide les champs
   - Envoie la réclamation à l'API
   - Affiche un message de succès/erreur
   - Recharge la liste des réclamations

4. **`getStatutLabel(statut)`**
   - Retourne le label français du statut

5. **`getStatutColor(statut)`**
   - Retourne les classes CSS pour le badge de statut

## Modifications apportées

### Fichier : `StudentDashboard.jsx`

**Lignes modifiées :**
- **52-59** : Ajout des états pour les réclamations
- **153-155** : Chargement des réclamations dans useEffect
- **372-467** : Ajout des fonctions de gestion des réclamations
- **586** : Changement de l'id de l'onglet de "complaints" à "reclamations"
- **818-825** : Ajout du bouton "Signaler un problème" dans l'historique
- **1043-1110** : Ajout du contenu de l'onglet réclamations
- **1380-1457** : Ajout de la modal de création de réclamation

## Test de l'interface

### Test 1 : Créer une réclamation

1. Se connecter en tant qu'étudiant
2. Aller dans "Historique"
3. Cliquer sur "Signaler un problème" sur une commande
4. Remplir :
   - Sujet : "Commande incomplète"
   - Description : "Il manquait le jus d'orange dans ma commande"
5. Cliquer sur "Envoyer la réclamation"

**Résultat attendu :**
```
✅ Réclamation créée avec succès !
```

**Vérifications :**
- Modal se ferme
- Onglet "Réclamations" affiche la nouvelle réclamation
- Statut : "Ouverte" (badge rouge)

### Test 2 : Consulter les réclamations

1. Aller dans l'onglet "Réclamations"
2. Vérifier l'affichage :
   - Badge de statut coloré
   - Date de création
   - Numéro de commande
   - Description
   - Résolution (si disponible)

**Résultat attendu :**
- Liste de toutes les réclamations
- Affichage clair et lisible
- Couleurs correspondant aux statuts

### Test 3 : Validation du formulaire

1. Ouvrir la modal de réclamation
2. Essayer de soumettre sans remplir les champs

**Résultat attendu :**
- Bouton "Envoyer" désactivé
- Message "Veuillez remplir tous les champs"

### Test 4 : Affichage de la résolution

1. Créer une réclamation
2. Attendre qu'un employé la traite et qu'un gérant la valide
3. Recharger l'onglet "Réclamations"

**Résultat attendu :**
- Encadré vert avec icône de check
- Titre "Résolution"
- Commentaire de résolution
- Date de clôture

## Captures d'écran attendues

### Historique avec bouton

```
┌─────────────────────────────────────────────────┐
│ Commande #15                    En préparation  │
│ 26 octobre 2025 à 14:13                        │
│                                                 │
│ 1x Eru                              1000 FCFA  │
│ 1x Jus d'Orange                      500 FCFA  │
│                                                 │
│ Montant total              1500 FCFA           │
│ Montant payé               1500 FCFA           │
│                                                 │
│ 🚚 Livraison                                   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │  ⚠️  Signaler un problème              │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Onglet Réclamations

```
┌─────────────────────────────────────────────────┐
│ Mes réclamations                                │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Commande incomplète        🔴 Ouverte   │   │
│ │ 26 octobre 2025 à 15:30                 │   │
│ │ Commande #15                            │   │
│ │                                         │   │
│ │ Il manquait le jus d'orange dans ma    │   │
│ │ commande                                │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Article froid              🟢 Validée   │   │
│ │ 25 octobre 2025 à 12:15                 │   │
│ │ Commande #12                            │   │
│ │                                         │   │
│ │ Le poulet était froid                   │   │
│ │                                         │   │
│ │ ┌─────────────────────────────────┐    │   │
│ │ │ ✅ Résolution                   │    │   │
│ │ │ Nous nous excusons. Un avoir    │    │   │
│ │ │ de 1000 FCFA a été crédité.     │    │   │
│ │ │ Clôturée le 25 octobre 2025     │    │   │
│ │ └─────────────────────────────────┘    │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Modal de création

```
┌─────────────────────────────────────────────────┐
│ Signaler un problème                            │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Commande #15                            │   │
│ │ 26 octobre 2025                         │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ Sujet de la réclamation *                      │
│ ┌─────────────────────────────────────────┐   │
│ │ Ex: Commande incomplète                 │   │
│ └─────────────────────────────────────────┘   │
│ 0/150 caractères                               │
│                                                 │
│ Description détaillée *                        │
│ ┌─────────────────────────────────────────┐   │
│ │ Décrivez le problème rencontré...       │   │
│ │                                         │   │
│ │                                         │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────┐  ┌──────────────────────────┐    │
│ │ Annuler │  │ 💬 Envoyer la réclamation│    │
│ └─────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

## Prochaines étapes

✅ **Dashboard Étudiant** - Implémenté
- [x] Bouton "Signaler un problème"
- [x] Modal de création
- [x] Onglet "Réclamations"
- [x] Affichage des résolutions

⏳ **Dashboard Employé** - À implémenter
- [ ] Liste des réclamations
- [ ] Bouton "Prendre en charge"
- [ ] Formulaire de résolution

⏳ **Dashboard Gérant** - À implémenter
- [ ] Liste des réclamations en attente de validation
- [ ] Boutons "Valider" / "Rejeter"

**L'interface étudiant est complète et fonctionnelle ! 🎉**
