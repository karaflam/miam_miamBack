# 👤 Profil Utilisateur & 🎁 Parrainage - Mon Miam Miam

## ✅ Fonctionnalités implémentées

### 1. Page de Profil (`/profile`)

#### Accès
- **Menu déroulant dans la navbar** : Cliquez sur votre nom dans la navbar pour afficher le menu
- **Lien "Mon profil"** : Accessible depuis le menu déroulant
- **Route protégée** : Accessible à tous les utilisateurs connectés (student, employee, manager, admin)

#### Fonctionnalités
- **Onglet "Informations personnelles"**
  - Modification du prénom et nom
  - Modification de l'email
  - Modification du téléphone
  - Modification de la localisation
  - Bouton "Enregistrer les modifications"

- **Onglet "Mot de passe"**
  - Saisie du mot de passe actuel
  - Saisie du nouveau mot de passe (min 8 caractères)
  - Confirmation du nouveau mot de passe
  - Validation côté client
  - Bouton "Modifier le mot de passe"

#### Design
- Header avec dégradé de couleur et avatar
- Tabs pour naviguer entre les sections
- Messages de succès/erreur avec icônes
- Formulaires avec icônes et validation
- Responsive design

### 2. Section Parrainage Améliorée

#### Nouvelles fonctionnalités

**Code de parrainage**
- Affichage du code dans un design attractif (dégradé de couleur)
- **Bouton "Copier"** avec feedback visuel
  - Icône Copy → Check quand copié
  - Texte "Copier" → "Copié!" pendant 2 secondes
  - Copie automatique dans le presse-papier

**Statistiques**
- Nombre total de filleuls
- Points totaux gagnés grâce au parrainage (10 points par filleul)

**Liste des filleuls**
- Affichage de tous les filleuls avec :
  - Avatar
  - Nom complet
  - Date d'inscription
  - Points gagnés (+10 points)
- Message si aucun filleul

**Guide "Comment ça marche"**
- 3 étapes expliquées clairement
- Design avec numéros dans des cercles
- Instructions détaillées

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers
- `src/pages/ProfilePage.jsx` - Page de profil complète

### Fichiers modifiés
- `src/components/Navbar.jsx` - Menu déroulant utilisateur
- `src/pages/StudentDashboard.jsx` - Section parrainage améliorée
- `src/App.jsx` - Route pour la page de profil

## 🎨 Composants UI

### Menu déroulant Navbar
```jsx
<div className="relative">
  <button onClick={() => setShowUserMenu(!showUserMenu)}>
    <User /> {user.name} <ChevronDown />
  </button>
  
  {showUserMenu && (
    <div className="dropdown-menu">
      <Link to="/profile">Mon profil</Link>
      <button onClick={handleLogout}>Déconnexion</button>
    </div>
  )}
</div>
```

### Bouton Copier le code
```jsx
const handleCopyCode = async () => {
  await navigator.clipboard.writeText(referralData.code)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

<button onClick={handleCopyCode}>
  {copied ? (
    <><Check /> Copié!</>
  ) : (
    <><Copy /> Copier</>
  )}
</button>
```

## 🔄 Intégration API (À faire)

### Endpoints nécessaires

#### Profil
```
GET  /api/user/profile       - Récupérer les infos du profil
PUT  /api/user/profile       - Mettre à jour les infos
PUT  /api/user/password      - Changer le mot de passe
```

#### Parrainage
```
GET  /api/referral/code      - Récupérer le code de parrainage
GET  /api/referral/referrals - Récupérer la liste des filleuls
```

### Exemple de réponse API

**GET /api/referral/code**
```json
{
  "success": true,
  "data": {
    "code": "ABC12345",
    "referrals_count": 5,
    "points_earned": 50
  }
}
```

**GET /api/referral/referrals**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "date": "2025-10-20T10:30:00Z",
      "points_awarded": 10
    }
  ]
}
```

## 🚀 Utilisation

### Accéder au profil
1. Connectez-vous à l'application
2. Cliquez sur votre nom dans la navbar (en haut à droite)
3. Cliquez sur "Mon profil"
4. Modifiez vos informations ou votre mot de passe

### Utiliser le parrainage
1. Allez dans votre espace étudiant
2. Cliquez sur l'onglet "Parrainage"
3. Cliquez sur "Copier" pour copier votre code
4. Partagez le code avec vos amis
5. Ils s'inscrivent avec votre code
6. Vous gagnez 10 points automatiquement

## 📊 Données mockées actuelles

```javascript
// Dans StudentDashboard.jsx
const [referralData, setReferralData] = useState({
  code: "ABC12345", // TODO: Récupérer depuis l'API
  referrals: [], // TODO: Récupérer depuis l'API
})
```

**Pour tester avec des données :**
```javascript
const [referralData, setReferralData] = useState({
  code: "ABC12345",
  referrals: [
    {
      name: "Marie Diallo",
      date: "2025-10-15T10:00:00Z"
    },
    {
      name: "Amadou Sow",
      date: "2025-10-18T14:30:00Z"
    }
  ]
})
```

## 🎯 Prochaines étapes

### Backend
1. **Créer les endpoints API** pour le profil et le parrainage
2. **Implémenter la logique** de mise à jour du profil
3. **Implémenter la logique** de changement de mot de passe
4. **Récupérer le code de parrainage** depuis la base de données
5. **Récupérer la liste des filleuls** depuis la base de données

### Frontend
1. **Connecter ProfilePage** aux API Laravel
2. **Connecter la section parrainage** aux API Laravel
3. **Ajouter la validation** des formulaires
4. **Gérer les erreurs** API
5. **Ajouter un loader** pendant les requêtes

## 🔐 Sécurité

- ✅ Routes protégées avec `ProtectedRoute`
- ✅ Vérification du rôle utilisateur
- ✅ Validation côté client (mot de passe min 8 caractères)
- ⏳ TODO: Validation côté serveur
- ⏳ TODO: Vérification du mot de passe actuel avant changement
- ⏳ TODO: Rate limiting sur les endpoints

## 🎨 Design

### Couleurs utilisées
- **Primary** : Couleur principale de l'app
- **Secondary** : Couleur secondaire
- **Success** : Vert pour les succès (#10B981)
- **Error** : Rouge pour les erreurs
- **Muted** : Gris pour les backgrounds

### Icônes (Lucide React)
- `User` - Profil utilisateur
- `ChevronDown` - Menu déroulant
- `Copy` - Copier
- `Check` - Confirmation de copie
- `Users` - Parrainage
- `Gift` - Récompenses
- `Save` - Enregistrer
- `Lock` - Mot de passe

## ✨ Améliorations futures

1. **Upload d'avatar** pour le profil
2. **Historique des modifications** du profil
3. **Partage social** du code de parrainage (WhatsApp, Facebook, etc.)
4. **QR Code** pour le code de parrainage
5. **Notifications** quand un filleul s'inscrit
6. **Classement** des meilleurs parrains
7. **Récompenses spéciales** pour X filleuls

---

**Date de création :** 24 octobre 2025  
**Version :** 1.0.0
