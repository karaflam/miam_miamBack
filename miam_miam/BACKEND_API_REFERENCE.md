# 🌐 Référence API Backend - Mon Miam Miam

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Endpoints Publics](#endpoints-publics)
4. [Endpoints Étudiants](#endpoints-étudiants)
5. [Endpoints Staff](#endpoints-staff)
6. [Endpoints Admin](#endpoints-admin)
7. [Codes de Réponse](#codes-de-réponse)
8. [Gestion des Erreurs](#gestion-des-erreurs)

---

## 🎯 Vue d'ensemble

**Base URL** : `http://localhost:8000/api`

**Format** : JSON  
**Authentification** : Laravel Sanctum (JWT Bearer Token)  
**Versioning** : v1 (implicite)

### Stack Technique Backend

- **Framework** : Laravel 12.x
- **Authentification** : Laravel Sanctum
- **Base de données** : MySQL 8.0
- **Paiement** : CinetPay PHP SDK
- **Images** : Intervention Image

---

## 🔐 Authentification

### Workflow d'Authentification

```
1. Client → POST /sanctum/csrf-cookie (récupérer cookie CSRF)
2. Client → POST /api/auth/login (recevoir token)
3. Client → Stockage token Bearer
4. Client → Requêtes avec header Authorization: Bearer {token}
```

### Protection CSRF

**Avant toute requête POST/PUT/DELETE** :
```bash
GET /sanctum/csrf-cookie
```

### Headers Requis

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {votre_token_jwt}
```

---

## 📍 Endpoints Publics

### 1. Test API

**GET** `/api/test`

**Réponse** :
```json
{
  "message": "API fonctionne!"
}
```

---

### 2. Authentification Étudiants

#### Login Étudiant

**POST** `/api/auth/login`

**Body** :
```json
{
  "email": "etudiant@example.com",
  "password": "password123"
}
```

**Réponse Succès** (200) :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "etudiant@example.com",
    "role": "student",
    "balance": 5000,
    "loyaltyPoints": 120,
    "telephone": "+237123456789"
  },
  "token": "1|abcdef123456..."
}
```

**Réponse Erreur** (401) :
```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

---

#### Inscription Étudiant

**POST** `/api/auth/register`

**Body** :
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "nouveau@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "telephone": "+237123456789",
  "code_parrain": "ABC123" // Optionnel
}
```

**Réponse Succès** (201) :
```json
{
  "success": true,
  "message": "Inscription réussie",
  "user": {
    "id": 2,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "nouveau@example.com",
    "role": "student",
    "balance": 0,
    "loyaltyPoints": 25 // Si code parrain utilisé
  },
  "token": "2|xyz789..."
}
```

**Validation** :
- `nom` : requis, string, max 100
- `prenom` : requis, string, max 100
- `email` : requis, email, unique
- `password` : requis, min 8, confirmé
- `telephone` : requis, regex format
- `code_parrain` : optionnel, existe dans DB

---

#### Mot de Passe Oublié

**POST** `/api/auth/forgot-password`

**Body** :
```json
{
  "email": "etudiant@example.com"
}
```

**Réponse** (200) :
```json
{
  "success": true,
  "message": "Lien de réinitialisation envoyé par email"
}
```

---

#### Réinitialiser Mot de Passe

**POST** `/api/auth/reset-password`

**Body** :
```json
{
  "token": "reset_token_from_email",
  "email": "etudiant@example.com",
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

---

### 3. Authentification Staff

#### Login Staff

**POST** `/api/staff/login`

**Body** :
```json
{
  "email": "employee@monmiammiam.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "success": true,
  "user": {
    "id": 10,
    "nom": "Martin",
    "prenom": "Sophie",
    "email": "employee@monmiammiam.com",
    "role": "employee",
    "poste": "Cuisinier"
  },
  "token": "10|staff_token..."
}
```

---

### 4. Menu Public

#### Liste des Articles

**GET** `/api/menu`

**Query Parameters** :
- `categorie` : ID de catégorie (optionnel)
- `disponible` : `true` ou `false` (optionnel)

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id_article": 1,
      "nom": "Poulet DG",
      "description": "Poulet braisé sauce tomate avec plantains",
      "prix": 2500,
      "image": "http://localhost:8000/storage/menu/poulet-dg.jpg",
      "disponible": true,
      "temps_preparation": 20,
      "categorie": {
        "id_categorie": 1,
        "nom": "Plats Principaux"
      }
    }
  ]
}
```

---

#### Détails d'un Article

**GET** `/api/menu/{id}`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id_article": 1,
    "nom": "Poulet DG",
    "description": "Description complète...",
    "prix": 2500,
    "image": "http://localhost:8000/storage/menu/poulet-dg.jpg",
    "disponible": true,
    "temps_preparation": 20,
    "valeur_nutritionnelle": "450 kcal",
    "ingredients": "Poulet, plantain, tomates...",
    "categorie": {...},
    "stock": {
      "quantite_disponible": 50
    }
  }
}
```

---

### 5. Données Homepage

#### Toutes les données homepage

**GET** `/api/home-data`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "top_clients": [
      {
        "id": 5,
        "nom_complet": "Jean Dupont",
        "points_fidelite": 250,
        "total_depense": 125000,
        "nombre_commandes": 45,
        "rang": 1
      }
    ],
    "promotions_actives": [
      {
        "id_evenement": 3,
        "titre": "-20% sur tous les plats",
        "description": "Promotion weekend",
        "type": "promotion",
        "code_promo": "WEEKEND20",
        "valeur_remise": 20,
        "type_remise": "pourcentage",
        "date_debut": "2024-11-01",
        "date_fin": "2024-11-30",
        "url_affiche": "http://localhost:8000/storage/evenements/promo.jpg"
      }
    ],
    "evenements_a_venir": [
      {
        "id_evenement": 5,
        "titre": "Match Champions League",
        "description": "Retransmission en direct",
        "type": "evenement",
        "date_debut": "2024-11-05 20:00:00",
        "date_fin": "2024-11-05 22:00:00"
      }
    ]
  }
}
```

---

## 🎓 Endpoints Étudiants (Authentifiés)

**Middleware** : `auth:sanctum`

### 1. Profil

#### Récupérer son Profil

**GET** `/api/profile`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "etudiant@example.com",
    "telephone": "+237123456789",
    "adresse": "Yaoundé, Cameroun",
    "balance": 5000,
    "points_fidelite": 120,
    "code_parrainage": "JEAN2024",
    "nombre_filleuls": 3,
    "created_at": "2024-01-15T10:30:00.000000Z"
  }
}
```

---

#### Mettre à Jour son Profil

**PUT** `/api/profile`

**Body** :
```json
{
  "nom": "Dupont",
  "prenom": "Jean-Marc",
  "email": "nouveau.email@example.com",
  "telephone": "+237987654321",
  "adresse": "Nouvelle adresse"
}
```

---

#### Changer Mot de Passe

**PUT** `/api/profile/password`

**Body** :
```json
{
  "current_password": "OldPassword123",
  "password": "NewPassword456!",
  "password_confirmation": "NewPassword456!"
}
```

---

### 2. Commandes

#### Créer une Commande

**POST** `/api/commandes`

**Body** :
```json
{
  "type_livraison": "livraison",
  "heure_arrivee": "12:30",
  "adresse_livraison": "Résidence La Terrasse, Chambre 205",
  "commentaire_client": "Sans piment SVP",
  "articles": [
    {
      "id": 1,
      "prix": 2500,
      "quantite": 2
    },
    {
      "id": 5,
      "prix": 1000,
      "quantite": 1
    }
  ]
}
```

**Réponse** (201) :
```json
{
  "success": true,
  "message": "Commande créée avec succès",
  "data": {
    "id_commande": 123,
    "numero_commande": "CMD-20241101-123",
    "montant_total": 6000,
    "statut": "en_attente",
    "type_livraison": "livraison",
    "heure_arrivee": "12:30:00",
    "articles": [...]
  }
}
```

---

#### Mes Commandes

**GET** `/api/commandes/mes-commandes`

**Query Parameters** :
- `statut` : `en_attente`, `en_preparation`, `prete`, `livree`, `annulee`
- `date_debut` : YYYY-MM-DD
- `date_fin` : YYYY-MM-DD

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id_commande": 123,
      "numero_commande": "CMD-20241101-123",
      "date_commande": "2024-11-01T10:30:00",
      "montant_total": 6000,
      "statut": "en_preparation",
      "type_livraison": "livraison",
      "articles_count": 3,
      "articles": [...]
    }
  ]
}
```

---

#### Détails Commande

**GET** `/api/commandes/{id}`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id_commande": 123,
    "numero_commande": "CMD-20241101-123",
    "date_commande": "2024-11-01T10:30:00",
    "montant_total": 6000,
    "statut": "en_preparation",
    "type_livraison": "livraison",
    "heure_arrivee": "12:30:00",
    "adresse_livraison": "Résidence La Terrasse, Chambre 205",
    "commentaire_client": "Sans piment SVP",
    "articles": [
      {
        "id_detail": 1,
        "article": {
          "id_article": 1,
          "nom": "Poulet DG",
          "image": "..."
        },
        "quantite": 2,
        "prix_unitaire": 2500,
        "sous_total": 5000
      }
    ],
    "paiement": {
      "methode": "mobile_money",
      "statut": "reussi",
      "transaction_id": "TXN123456"
    }
  }
}
```

---

### 3. Réclamations

#### Créer une Réclamation

**POST** `/api/reclamations`

**Body** :
```json
{
  "id_commande": 123, // Optionnel
  "type_reclamation": "qualite_produit",
  "description": "Le plat était froid à l'arrivée",
  "priorite": "moyenne"
}
```

**Types de réclamation** :
- `qualite_produit`
- `delai_livraison`
- `service_client`
- `erreur_commande`
- `autre`

**Priorité** :
- `basse`
- `moyenne`
- `haute`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "id_reclamation": 45,
    "numero_reclamation": "REC-20241101-045",
    "type_reclamation": "qualite_produit",
    "statut": "en_attente",
    "priorite": "moyenne",
    "date_creation": "2024-11-01T15:00:00"
  }
}
```

---

#### Mes Réclamations

**GET** `/api/reclamations/mes-reclamations`

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id_reclamation": 45,
      "numero_reclamation": "REC-20241101-045",
      "type_reclamation": "qualite_produit",
      "description": "Le plat était froid",
      "statut": "en_traitement",
      "priorite": "moyenne",
      "date_creation": "2024-11-01T15:00:00",
      "commande": {
        "numero_commande": "CMD-20241101-123"
      },
      "reponse_employe": "Nous sommes désolés. Nous vous offrons 10% de réduction."
    }
  ]
}
```

---

### 4. Parrainage

#### Mon Code de Parrainage

**GET** `/api/referral/code`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "code": "JEAN2024",
    "nombre_filleuls": 3,
    "points_gagnes": 150
  }
}
```

---

#### Mes Filleuls

**GET** `/api/referral/referrals`

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "nom_complet": "Marie Martin",
      "email": "marie@example.com",
      "date_inscription": "2024-10-15T08:00:00",
      "points_attribues": 50
    }
  ]
}
```

---

### 5. Fidélité

#### Solde de Points

**GET** `/api/fidelite/solde`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "points_disponibles": 120,
    "points_lifetime": 450,
    "points_expires_soon": 20,
    "date_expiration_prochaine": "2024-12-31"
  }
}
```

---

#### Historique Points

**GET** `/api/fidelite/historique`

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type_transaction": "gain",
      "source": "commande",
      "points": 25,
      "description": "Commande #CMD-20241101-123",
      "date": "2024-11-01T12:00:00"
    },
    {
      "id": 2,
      "type_transaction": "utilisation",
      "source": "reduction",
      "points": -50,
      "description": "Réduction sur commande",
      "date": "2024-11-02T10:00:00"
    }
  ]
}
```

---

### 6. Paiement

#### Initier un Paiement

**POST** `/api/paiement/initier`

**Body** :
```json
{
  "id_commande": 123,
  "montant": 6000,
  "methode": "orange_money",
  "telephone": "+237123456789"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "payment_url": "https://checkout.cinetpay.com/payment/abc123",
    "payment_token": "abc123xyz",
    "transaction_id": "TXN-123456"
  }
}
```

---

#### Recharger le Compte

**POST** `/api/paiement/recharger`

**Body** :
```json
{
  "montant": 10000,
  "methode": "mtn_money",
  "telephone": "+237987654321"
}
```

---

### 7. Événements

#### Participer à un Événement

**POST** `/api/evenements/{id}/participer`

**Réponse** :
```json
{
  "success": true,
  "message": "Participation enregistrée",
  "data": {
    "points_gagnes": 10,
    "message_recompense": "Vous avez gagné 10 points de fidélité !"
  }
}
```

---

## 👔 Endpoints Staff (Employee/Manager)

**Middleware** : `auth:sanctum`, `role:employee,manager,admin`

### 1. Commandes Staff

#### Toutes les Commandes

**GET** `/api/staff/commandes`

**Query Parameters** :
- `statut` : filtre par statut
- `date` : YYYY-MM-DD

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id_commande": 123,
      "numero_commande": "CMD-20241101-123",
      "client": {
        "nom_complet": "Jean Dupont",
        "telephone": "+237123456789"
      },
      "montant_total": 6000,
      "statut": "en_attente",
      "date_commande": "2024-11-01T10:30:00",
      "articles_count": 3
    }
  ]
}
```

---

#### Changer Statut Commande

**PUT** `/api/staff/commandes/{id}/status`

**Body** :
```json
{
  "statut": "en_preparation"
}
```

**Statuts possibles** :
- `en_attente`
- `en_preparation`
- `prete`
- `livree`
- `annulee`

---

### 2. Menu Management

#### Créer un Article

**POST** `/api/menu`

**Body** (multipart/form-data) :
```
nom: "Nouveau Plat"
description: "Description du plat"
prix: 3000
id_categorie: 1
temps_preparation: 25
image: [fichier]
disponible: true
```

---

#### Modifier un Article

**PUT** `/api/menu/{id}`

**Body** :
```json
{
  "nom": "Poulet DG Deluxe",
  "prix": 3000,
  "disponible": true
}
```

---

#### Supprimer un Article

**DELETE** `/api/menu/{id}`

---

#### Toggle Disponibilité

**POST** `/api/menu/{id}/toggle-disponibilite`

---

### 3. Réclamations Staff

#### Toutes les Réclamations

**GET** `/api/staff/reclamations`

---

#### Assigner une Réclamation

**POST** `/api/staff/reclamations/{id}/assign`

**Body** :
```json
{
  "id_employe": 5
}
```

---

#### Changer Statut Réclamation

**PUT** `/api/staff/reclamations/{id}/status`

**Body** :
```json
{
  "statut": "traitee",
  "reponse": "Nous avons résolu le problème"
}
```

**Statuts** :
- `en_attente`
- `en_traitement`
- `traitee`
- `rejetee`

---

### 4. Statistiques

#### Statistiques Réclamations

**GET** `/api/staff/reclamations/statistics`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "total": 150,
    "en_attente": 10,
    "en_traitement": 5,
    "traitees": 130,
    "rejetees": 5,
    "taux_resolution": 86.67
  }
}
```

---

## 👨‍💼 Endpoints Admin

**Middleware** : `auth:sanctum`, `role:admin,manager`

### 1. Gestion Utilisateurs

#### Liste Utilisateurs

**GET** `/api/admin/users`

**Query Parameters** :
- `role` : student, employee, manager
- `page` : pagination

---

#### Créer un Employé

**POST** `/api/admin/users`

**Body** :
```json
{
  "nom": "Martin",
  "prenom": "Sophie",
  "email": "sophie.martin@monmiammiam.com",
  "password": "TempPassword123",
  "role": "employee",
  "poste": "Cuisinière",
  "telephone": "+237123456789"
}
```

---

#### Modifier un Utilisateur

**PUT** `/api/admin/users/{id}`

---

#### Suspendre/Activer

**POST** `/api/admin/users/{id}/suspend`

**POST** `/api/admin/users/{id}/activate`

---

#### Ajuster Points Fidélité

**POST** `/api/admin/users/{id}/adjust-points`

**Body** :
```json
{
  "points": 50,
  "type": "gain",
  "description": "Bonus anniversaire"
}
```

---

### 2. Dashboard Admin

#### Statistiques Générales

**GET** `/api/admin/dashboard/stats`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "total_commandes_aujourd_hui": 45,
    "ca_aujourd_hui": 225000,
    "total_utilisateurs": 1250,
    "commandes_en_attente": 8,
    "reclamations_non_traitees": 3
  }
}
```

---

#### Performance Globale

**GET** `/api/admin/dashboard/performance-globale`

---

### 3. Événements

#### Créer Événement/Promotion

**POST** `/api/evenements`

**Body** (multipart/form-data) :
```
titre: "Promotion Halloween"
description: "30% de réduction"
type: "promotion"
code_promo: "HALLOWEEN30"
valeur_remise: 30
type_remise: "pourcentage"
date_debut: "2024-10-31"
date_fin: "2024-11-01"
affiche: [fichier image]
active: "oui"
```

---

#### Modifier Événement

**PUT** `/api/evenements/{id}`

---

#### Supprimer Événement

**DELETE** `/api/evenements/{id}`

---

#### Activer/Désactiver

**PATCH** `/api/evenements/{id}/toggle`

---

## 📊 Codes de Réponse HTTP

| Code | Signification | Utilisation |
|------|---------------|-------------|
| **200** | OK | Requête réussie |
| **201** | Created | Ressource créée |
| **204** | No Content | Suppression réussie |
| **400** | Bad Request | Données invalides |
| **401** | Unauthorized | Non authentifié |
| **403** | Forbidden | Accès refusé |
| **404** | Not Found | Ressource introuvable |
| **422** | Unprocessable Entity | Erreurs de validation |
| **500** | Server Error | Erreur serveur |

---

## ⚠️ Gestion des Erreurs

### Format Standard d'Erreur

```json
{
  "success": false,
  "message": "Message d'erreur principal",
  "errors": {
    "email": ["L'email est requis"],
    "password": ["Le mot de passe doit contenir au moins 8 caractères"]
  }
}
```

### Exemples d'Erreurs Courantes

#### 401 - Non Authentifié
```json
{
  "message": "Unauthenticated."
}
```

#### 403 - Accès Refusé
```json
{
  "success": false,
  "message": "Vous n'avez pas les permissions nécessaires"
}
```

#### 422 - Validation
```json
{
  "success": false,
  "message": "Les données fournies sont invalides",
  "errors": {
    "nom": ["Le nom est requis"],
    "email": ["L'email est invalide"]
  }
}
```

---

## 🔄 Rate Limiting

- **Authentification** : 5 tentatives / minute
- **API générale** : 60 requêtes / minute (authentifié)
- **API publique** : 30 requêtes / minute

**Header de réponse** :
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
```

---

**Version API** : 1.0.0  
**Dernière mise à jour** : Novembre 2024  
**Support** : api-support@monmiammiam.com
