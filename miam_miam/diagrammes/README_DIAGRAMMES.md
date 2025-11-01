# 📊 Documentation Complète des Diagrammes - Mon Miam Miam

## 🎯 Vue d'ensemble

Ce dossier contient **tous les diagrammes UML et MERISE** du projet Mon Miam Miam, générés avec **PlantUML**.

---

## 📁 Liste des Diagrammes Créés

### 🔷 Diagrammes UML Comportementaux

| Fichier | Type | Description | Pages |
|---------|------|-------------|-------|
| **usecase_diagram.puml** | Cas d'utilisation | Tous les cas d'utilisation par acteur (Étudiant, Staff, Admin) | 1 |
| **sequence_passer_commande.puml** | Séquence | Processus complet de passage de commande avec paiement | 2-3 |
| **sequence_gestion_commande_staff.puml** | Séquence | Gestion des commandes par le staff (préparation, livraison) | 2-3 |
| **sequence_parrainage.puml** | Séquence | Système de parrainage et attribution de points | 2 |
| **sequence_utilisation_points.puml** | Séquence | Utilisation des points de fidélité pour réduction | 2 |
| **activity_traitement_reclamation.puml** | Activité | Processus de traitement des réclamations | 1-2 |
| **activity_authentification.puml** | Activité | Processus d'inscription et connexion | 2 |
| **activity_gestion_stock.puml** | Activité | Gestion des stocks et alertes | 2 |
| **state_diagram_commande.puml** | États | Cycle de vie d'une commande (états et transitions) | 1 |

### 🔶 Diagrammes UML Structurels

| Fichier | Type | Description | Pages |
|---------|------|-------------|-------|
| **class_diagram.puml** | Classes | Architecture complète (Entités, Services, Controllers) | 2 |
| **component_diagram.puml** | Composants | Architecture Frontend/Backend en composants | 1-2 |
| **deployment_diagram.puml** | Déploiement | Infrastructure technique et serveurs | 1 |

### 🔸 Diagrammes MERISE

| Fichier | Type | Description | Pages |
|---------|------|-------------|-------|
| **er_diagram_merise.puml** | MCD | Modèle Conceptuel de Données avec cardinalités MERISE | 2-3 |

---

## 🚀 Génération des Images

### Prérequis

1. **Java** (requis pour PlantUML)
2. **Graphviz** (pour diagrammes complexes)
3. **Extension VS Code PlantUML** (recommandé)

### Méthode 1 : VS Code (Recommandé)

```bash
# 1. Installer l'extension PlantUML dans VS Code
# 2. Ouvrir un fichier .puml
# 3. Appuyer sur Alt+D pour prévisualiser
# 4. Clic droit → "Export Current Diagram"
# 5. Choisir le format (PNG, SVG, PDF)
```

### Méthode 2 : Ligne de commande

```powershell
# Naviguer vers le dossier
cd "c:\Users\Dorian Simo\Downloads\miam_miamBack\miam_miam\diagrammes"

# Générer tous les PNG
java -jar plantuml.jar -tpng *.puml

# Générer tous les SVG (haute qualité)
java -jar plantuml.jar -tsvg *.puml

# Générer tous les PDF
java -jar plantuml.jar -tpdf *.puml
```

### Méthode 3 : Script automatisé

Créer `generer_tous_diagrammes.ps1` :

```powershell
$outputDir = ".\images"
New-Item -ItemType Directory -Force -Path $outputDir

Write-Host "🎨 Génération des diagrammes..." -ForegroundColor Cyan

# PNG haute résolution
java -jar plantuml.jar -tpng -DPLANTUML_LIMIT_SIZE=16384 -o "$outputDir" "*.puml"

# SVG vectoriel
java -jar plantuml.jar -tsvg -o "$outputDir" "*.puml"

Write-Host "✅ Terminé! Images dans: $outputDir" -ForegroundColor Green
```

---

## 📐 Diagrammes MERISE à Créer avec Draw.io

Les diagrammes suivants doivent être créés manuellement avec **Draw.io** :

### 1. MLD (Modèle Logique de Données)

**Transformation du MCD** :

```
USER (id_user, nom, prenom, email, password, role, solde, points_fidelite, code_parrainage)
├─ PK: id_user
├─ UNIQUE: email, code_parrainage

COMMANDE (id_commande, numero_commande, id_user#, date_commande, montant_total, statut)
├─ PK: id_commande
├─ FK: id_user → USER(id_user)
├─ UNIQUE: numero_commande
├─ INDEX: idx_commande_user (id_user)

DETAIL_COMMANDE (id_detail_commande, id_commande#, id_article#, quantite, prix_unitaire, sous_total)
├─ PK: id_detail_commande
├─ FK: id_commande → COMMANDE(id_commande)
├─ FK: id_article → MENU(id_article)

MENU (id_article, nom, prix, id_categorie#, disponible, image)
├─ PK: id_article
├─ FK: id_categorie → CATEGORIE_MENU(id_categorie)

PAIEMENT (id_paiement, id_commande#, id_user#, reference, montant, methode, statut, transaction_id)
├─ PK: id_paiement
├─ FK: id_commande → COMMANDE(id_commande)
├─ FK: id_user → USER(id_user)
├─ UNIQUE: reference

PARRAINAGE (id_parrainage, id_parrain#, id_filleul#, code_parrainage, date_parrainage, statut)
├─ PK: id_parrainage
├─ FK: id_parrain → USER(id_user)
├─ FK: id_filleul → USER(id_user)

SUIVI_POINT (id_suivi_point, id_user#, type_transaction, points, source, description, date_transaction)
├─ PK: id_suivi_point
├─ FK: id_user → USER(id_user)
├─ INDEX: idx_suivi_user (id_user)
```

### 2. MPD (Modèle Physique de Données)

**Avec types SQL MySQL** :

```sql
CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    adresse TEXT,
    role ENUM('student', 'employee', 'manager', 'admin') NOT NULL,
    solde DECIMAL(10,2) DEFAULT 0.00,
    points_fidelite INT DEFAULT 0,
    code_parrainage VARCHAR(20) UNIQUE,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. MCT (Modèle Conceptuel des Traitements)

**Processus : Passage de Commande**

```
┌─────────────────────────────────┐
│ ÉVÉNEMENT DÉCLENCHEUR           │
│ Étudiant sélectionne articles   │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ OPÉRATION 1                     │
│ Calculer montant total          │
└───────────────┬─────────────────┘
                │
                ▼
         ┌──────────────┐
         │ CONDITION    │
         │ Code promo ? │
         └──┬────────┬──┘
       OUI  │        │ NON
            ▼        ▼
    ┌────────────┐  │
    │ OPÉRATION 2│  │
    │ Appliquer  │  │
    │ remise     │  │
    └─────┬──────┘  │
          └────┬────┘
               ▼
┌─────────────────────────────────┐
│ OPÉRATION 3                     │
│ Créer commande en BDD           │
└───────────────┬─────────────────┘
                ▼
┌─────────────────────────────────┐
│ OPÉRATION 4                     │
│ Initialiser paiement CinetPay   │
└───────────────┬─────────────────┘
                │
                ▼
         ┌──────────────┐
         │ CONDITION    │
         │ Paiement OK? │
         └──┬────────┬──┘
       OUI  │        │ NON
            ▼        ▼
    ┌────────────┐ ┌────────────┐
    │ OPÉRATION 5│ │ OPÉRATION 6│
    │ Confirmer  │ │ Annuler    │
    │ commande   │ │ commande   │
    └─────┬──────┘ └─────┬──────┘
          │              │
          ▼              ▼
┌─────────────────┐ ┌─────────────────┐
│ ÉVÉNEMENT       │ │ ÉVÉNEMENT       │
│ RÉSULTAT        │ │ RÉSULTAT        │
│ Commande validée│ │ Commande annulée│
└─────────────────┘ └─────────────────┘
```

### 4. MOT (Modèle Organisationnel des Traitements)

**Tableau Qui-Quoi-Quand-Où** :

| Acteur | Opération | Quand | Où | Durée |
|--------|-----------|-------|-----|-------|
| **Étudiant** | Sélectionne articles | Heures ouverture | Application web/mobile | 2-5 min |
| **Étudiant** | Valide panier | Après sélection | Application | 30 sec |
| **Système** | Calcule montant | Immédiatement | Serveur backend | < 1 sec |
| **Étudiant** | Effectue paiement | Après validation | CinetPay | 1-2 min |
| **CinetPay** | Traite paiement | Immédiatement | API externe | 5-30 sec |
| **Système** | Enregistre commande | Après paiement | Base de données | < 1 sec |
| **Système** | Notifie staff | Immédiatement | Email + Dashboard | < 5 sec |
| **Employé** | Consulte commande | Dès notification | Dashboard staff | 30 sec |
| **Employé** | Prépare commande | Immédiatement | Cuisine | 15-25 min |
| **Employé** | Change statut "prête" | Fin préparation | Dashboard | 10 sec |
| **Système** | Notifie client | Immédiatement | Email + SMS | < 5 sec |
| **Étudiant** | Récupère commande | À l'heure indiquée | Restaurant | 2 min |
| **Employé** | Valide livraison | À la remise | Dashboard | 10 sec |
| **Système** | Attribue points | Immédiatement | Base de données | < 1 sec |

---

## 🎨 Personnalisation des Diagrammes

### Thème Mon Miam Miam

Ajouter en début de fichier `.puml` :

```plantuml
skinparam backgroundColor #FFFFFF
skinparam actorBackgroundColor #CFBD97
skinparam actorBorderColor #000000
skinparam usecaseBackgroundColor #F5F5DC
skinparam usecaseBorderColor #CFBD97
skinparam sequenceLifeLineBorderColor #CFBD97
skinparam sequenceParticipantBackgroundColor #F5F5DC
skinparam noteBackgroundColor #FFFACD
skinparam noteBorderColor #CFBD97
```

---

## 📊 Utilisation pour la Soutenance

### Format par Support

| Support | Format Recommandé | Résolution |
|---------|-------------------|------------|
| **PowerPoint** | PNG | 1920x1080 px, 300 DPI |
| **Word** | PNG | 1200x800 px, 300 DPI |
| **PDF** | SVG ou PDF | Vectoriel |
| **Impression A4** | PDF | Vectoriel |
| **Impression A3** | PDF | Vectoriel |
| **Web** | SVG | Vectoriel |

### Ordre de Présentation Recommandé

1. **Diagramme de cas d'utilisation** (Vue d'ensemble)
2. **Diagramme de déploiement** (Architecture technique)
3. **MCD MERISE** (Structure données)
4. **Diagramme de séquence - Passer commande** (Processus principal)
5. **Diagramme d'états - Commande** (Cycle de vie)
6. **Diagramme de classes** (Architecture logicielle)
7. **Autres diagrammes** selon questions du jury

---

## 📚 Ressources

- **PlantUML** : https://plantuml.com/fr/
- **Draw.io** : https://app.diagrams.net/
- **MERISE** : http://merise.developpez.com/
- **UML** : https://www.uml-diagrams.org/

---

## ✅ Checklist Complète

### Diagrammes PlantUML (Créés ✓)

- [x] Cas d'utilisation
- [x] Séquence - Passer commande
- [x] Séquence - Gestion staff
- [x] Séquence - Parrainage
- [x] Séquence - Utilisation points
- [x] Activité - Réclamation
- [x] Activité - Authentification
- [x] Activité - Gestion stock
- [x] États - Cycle commande
- [x] Classes - Architecture
- [x] Composants - Architecture
- [x] Déploiement - Infrastructure
- [x] ER MERISE - MCD

### Diagrammes Draw.io (À créer)

- [ ] MLD (Modèle Logique)
- [ ] MPD (Modèle Physique)
- [ ] MCT (Traitements Conceptuel)
- [ ] MOT (Traitements Organisationnel)

---

**Total : 13 diagrammes PlantUML créés + 4 diagrammes MERISE à créer avec Draw.io**

**Version** : 1.0.0  
**Date** : Novembre 2024  
**Auteur** : Équipe Mon Miam Miam
