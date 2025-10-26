# 📋 Système de Réclamations - Workflow Complet

## Vue d'ensemble

Le système de réclamations permet aux étudiants de signaler des problèmes sur leurs commandes et de suivre leur résolution à travers un workflow en plusieurs étapes.

## Workflow des statuts

```
┌─────────────────────────────────────────────────────────────────┐
│                        WORKFLOW RÉCLAMATIONS                     │
└─────────────────────────────────────────────────────────────────┘

1. ÉTUDIANT                                                          
   └─> Crée une réclamation depuis l'historique des commandes       
       Statut: "ouvert" 🔴                                          

2. EMPLOYÉ                                                           
   └─> Prend en charge la réclamation                              
       Statut: "en_cours" 🟡                                        
   └─> Traite le problème et propose une résolution                
       Statut: "en_attente_validation" 🟠                           

3. GÉRANT                                                            
   └─> Consulte les réclamations résolues                          
   └─> Valide la résolution proposée                               
       Statut: "valide" 🟢                                          
   └─> OU rejette la résolution                                    
       Statut: "rejete" 🔴                                          

4. ÉTUDIANT                                                          
   └─> Reçoit la notification de résolution                        
   └─> Consulte la résolution dans son historique                  
       Statut final: "valide" ou "rejete"                          
```

## Statuts disponibles

| Statut | Description | Qui peut le définir | Couleur |
|--------|-------------|---------------------|---------|
| `ouvert` | Réclamation créée, en attente de prise en charge | Système (création) | 🔴 Rouge |
| `en_cours` | Réclamation assignée à un employé, en cours de traitement | Employé | 🟡 Jaune |
| `en_attente_validation` | Résolution proposée par l'employé, en attente de validation | Employé | 🟠 Orange |
| `valide` | Résolution validée par le gérant et retournée au client | Gérant | 🟢 Vert |
| `resolu` | (Optionnel) Résolution directe sans validation | Employé/Gérant | ✅ Vert clair |
| `rejete` | Résolution rejetée par le gérant | Gérant | ❌ Rouge foncé |

## Fonctionnalités par rôle

### 👨‍🎓 ÉTUDIANT

#### 1. Créer une réclamation depuis l'historique

**Depuis :** Historique des commandes → Bouton "Signaler un problème"

**Formulaire :**
- Commande concernée (pré-remplie)
- Sujet (max 150 caractères)
- Description détaillée

**API :**
```javascript
POST /api/reclamations
{
  "id_commande": 15,
  "sujet": "Commande incomplète",
  "description": "Il manquait le jus d'orange dans ma commande"
}
```

#### 2. Consulter ses réclamations

**Depuis :** Dashboard → Onglet "Réclamations"

**Affichage :**
- Liste de toutes ses réclamations
- Statut actuel
- Date de création
- Commande associée
- Résolution (si disponible)

**API :**
```javascript
GET /api/reclamations/mes-reclamations
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id_reclamation": 1,
      "id_commande": 15,
      "sujet": "Commande incomplète",
      "description": "Il manquait le jus d'orange",
      "statut": "valide",
      "date_ouverture": "2025-10-26 15:30:00",
      "date_cloture": "2025-10-26 16:45:00",
      "commentaire_resolution": "Nous nous excusons. Un avoir de 500 FCFA a été crédité sur votre compte.",
      "commande": {
        "id_commande": 15,
        "montant_total": 2500
      }
    }
  ]
}
```

### 👷 EMPLOYÉ

#### 1. Voir toutes les réclamations

**Depuis :** Dashboard Employé → Onglet "Réclamations"

**Filtres :**
- Par statut (ouvert, en_cours, en_attente_validation)
- Par employé assigné

**API :**
```javascript
GET /api/staff/reclamations?statut=ouvert
```

#### 2. Prendre en charge une réclamation

**Action :** Cliquer sur "Prendre en charge"

**API :**
```javascript
POST /api/staff/reclamations/{id}/assign
{
  "id_employe_assigne": 2
}
```

**Effet :** Statut passe de `ouvert` à `en_cours`

#### 3. Traiter et proposer une résolution

**Formulaire :**
- Commentaire de résolution (obligatoire)
- Actions entreprises
- Compensation proposée (si applicable)

**API :**
```javascript
PUT /api/staff/reclamations/{id}/status
{
  "statut": "en_attente_validation",
  "commentaire_resolution": "Problème vérifié. Nous avons crédité 500 FCFA sur le compte du client en compensation."
}
```

**Effet :** 
- Statut passe à `en_attente_validation`
- Réclamation visible par les gérants

### 👔 GÉRANT

#### 1. Consulter les réclamations en attente de validation

**Depuis :** Dashboard Gérant → Onglet "Réclamations" → Filtre "En attente de validation"

**API :**
```javascript
GET /api/staff/reclamations?statut=en_attente_validation
```

**Affichage :**
- Détails de la réclamation
- Résolution proposée par l'employé
- Historique des actions

#### 2. Valider une résolution

**Action :** Cliquer sur "Valider la résolution"

**API :**
```javascript
PUT /api/staff/reclamations/{id}/status
{
  "statut": "valide",
  "commentaire_resolution": "Résolution approuvée. Le client a été compensé."
}
```

**Effet :**
- Statut passe à `valide`
- Date de clôture enregistrée
- Client peut voir la résolution

#### 3. Rejeter une résolution

**Action :** Cliquer sur "Rejeter" + Ajouter un commentaire

**API :**
```javascript
PUT /api/staff/reclamations/{id}/status
{
  "statut": "rejete",
  "commentaire_resolution": "Résolution insuffisante. Veuillez proposer une meilleure compensation."
}
```

**Effet :**
- Statut passe à `rejete`
- Employé doit retraiter la réclamation

## Structure de la base de données

### Table `reclamations`

```sql
CREATE TABLE reclamations (
    id_reclamation BIGSERIAL PRIMARY KEY,
    id_utilisateur BIGINT NOT NULL,
    id_commande BIGINT NULL,
    id_employe_assigne BIGINT NULL,
    sujet VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    statut VARCHAR(50) CHECK (statut IN (
        'ouvert', 
        'en_cours', 
        'en_attente_validation', 
        'valide', 
        'resolu', 
        'rejete'
    )) DEFAULT 'ouvert',
    date_ouverture TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_cloture TIMESTAMP NULL,
    commentaire_resolution TEXT NULL,
    
    FOREIGN KEY (id_utilisateur) REFERENCES users(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande) ON DELETE SET NULL,
    FOREIGN KEY (id_employe_assigne) REFERENCES employes(id_employe) ON DELETE SET NULL
);
```

## Routes API

### Routes étudiants (protégées par auth:sanctum)

```php
// Créer une réclamation
POST /api/reclamations

// Voir ses réclamations
GET /api/reclamations/mes-reclamations

// Voir une réclamation spécifique
GET /api/reclamations/{id}
```

### Routes staff (protégées par auth:sanctum + role:admin,employe,manager)

```php
// Voir toutes les réclamations
GET /api/staff/reclamations

// Statistiques
GET /api/staff/reclamations/statistics

// Assigner une réclamation
POST /api/staff/reclamations/{id}/assign

// Mettre à jour le statut
PUT /api/staff/reclamations/{id}/status
```

## Modifications apportées

### 1. Migration

✅ **Fichier** : `2025_10_26_175526_add_en_attente_validation_to_reclamations.php`

```php
// Ajout des statuts 'en_attente_validation' et 'valide'
ALTER TABLE reclamations 
ADD CONSTRAINT reclamations_statut_check 
CHECK (statut IN (
    'ouvert', 
    'en_cours', 
    'en_attente_validation', 
    'valide', 
    'resolu', 
    'rejete'
));
```

### 2. ReclamationController

✅ **Modifications :**
- Validation mise à jour pour accepter les nouveaux statuts
- Date de clôture enregistrée pour `valide`, `resolu`, et `rejete`
- Statistiques incluent les nouveaux statuts

## Interface utilisateur à implémenter

### Dashboard Étudiant

#### Onglet "Historique des commandes"

```jsx
// Pour chaque commande
<div className="commande-card">
  <div className="commande-details">
    {/* Détails de la commande */}
  </div>
  
  <button 
    onClick={() => openReclamationModal(commande.id_commande)}
    className="btn-signaler"
  >
    <AlertCircle className="icon" />
    Signaler un problème
  </button>
</div>
```

#### Onglet "Réclamations"

```jsx
<div className="reclamations-list">
  {reclamations.map(reclamation => (
    <div key={reclamation.id_reclamation} className="reclamation-card">
      <div className="reclamation-header">
        <span className={`statut-badge statut-${reclamation.statut}`}>
          {getStatutLabel(reclamation.statut)}
        </span>
        <span className="date">{formatDate(reclamation.date_ouverture)}</span>
      </div>
      
      <h3>{reclamation.sujet}</h3>
      <p>{reclamation.description}</p>
      
      {reclamation.commande && (
        <div className="commande-link">
          Commande #{reclamation.commande.id_commande}
        </div>
      )}
      
      {reclamation.commentaire_resolution && (
        <div className="resolution">
          <h4>Résolution :</h4>
          <p>{reclamation.commentaire_resolution}</p>
        </div>
      )}
    </div>
  ))}
</div>
```

### Dashboard Employé

#### Onglet "Réclamations"

```jsx
<div className="reclamations-staff">
  <div className="filters">
    <select onChange={(e) => setStatutFilter(e.target.value)}>
      <option value="all">Toutes</option>
      <option value="ouvert">Ouvertes</option>
      <option value="en_cours">En cours</option>
      <option value="en_attente_validation">En attente validation</option>
    </select>
  </div>
  
  <div className="reclamations-grid">
    {reclamations.map(reclamation => (
      <div key={reclamation.id_reclamation} className="reclamation-card-staff">
        <div className="reclamation-info">
          <h3>{reclamation.sujet}</h3>
          <p className="client">
            Client: {reclamation.utilisateur.nom} {reclamation.utilisateur.prenom}
          </p>
          <p className="description">{reclamation.description}</p>
        </div>
        
        {reclamation.statut === 'ouvert' && (
          <button onClick={() => assignerReclamation(reclamation.id_reclamation)}>
            Prendre en charge
          </button>
        )}
        
        {reclamation.statut === 'en_cours' && (
          <button onClick={() => openResolutionModal(reclamation)}>
            Proposer une résolution
          </button>
        )}
      </div>
    ))}
  </div>
</div>
```

### Dashboard Gérant

#### Onglet "Réclamations à valider"

```jsx
<div className="reclamations-validation">
  {reclamationsEnAttente.map(reclamation => (
    <div key={reclamation.id_reclamation} className="reclamation-validation-card">
      <div className="reclamation-details">
        <h3>{reclamation.sujet}</h3>
        <p className="client">
          Client: {reclamation.utilisateur.nom} {reclamation.utilisateur.prenom}
        </p>
        <p className="description">{reclamation.description}</p>
        
        <div className="resolution-proposee">
          <h4>Résolution proposée par l'employé :</h4>
          <p>{reclamation.commentaire_resolution}</p>
          <p className="employe">
            Par: {reclamation.employeAssigne.nom}
          </p>
        </div>
      </div>
      
      <div className="actions">
        <button 
          onClick={() => validerResolution(reclamation.id_reclamation)}
          className="btn-valider"
        >
          ✅ Valider
        </button>
        
        <button 
          onClick={() => rejeterResolution(reclamation.id_reclamation)}
          className="btn-rejeter"
        >
          ❌ Rejeter
        </button>
      </div>
    </div>
  ))}
</div>
```

## Prochaines étapes

### Backend ✅ (Déjà fait)
- [x] Migration pour ajouter les nouveaux statuts
- [x] Mise à jour du ReclamationController
- [x] Routes API configurées

### Frontend (À implémenter)
- [ ] Bouton "Signaler un problème" dans l'historique des commandes (étudiant)
- [ ] Modal de création de réclamation (étudiant)
- [ ] Onglet "Réclamations" dans le dashboard étudiant
- [ ] Onglet "Réclamations" dans le dashboard employé
- [ ] Onglet "Réclamations à valider" dans le dashboard gérant
- [ ] Notifications en temps réel (optionnel)

**Le backend est prêt ! Il ne reste plus qu'à implémenter l'interface utilisateur. 🚀**
