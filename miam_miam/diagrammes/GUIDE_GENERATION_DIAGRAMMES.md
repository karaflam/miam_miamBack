# 🎨 Guide de Génération des Diagrammes MERISE - Mon Miam Miam

## 📋 Table des Matières

1. [Fichiers PlantUML Créés](#fichiers-plantuml-créés)
2. [Installation des Outils](#installation-des-outils)
3. [Génération des Images](#génération-des-images)
4. [Création des Diagrammes MERISE avec Draw.io](#création-des-diagrammes-merise-avec-drawio)
5. [Templates Draw.io](#templates-drawio)

---

## 📦 Fichiers PlantUML Créés

Les fichiers suivants ont été créés dans le dossier `diagrammes/` :

| Fichier | Description | Type |
|---------|-------------|------|
| **usecase_diagram.puml** | Diagramme de cas d'utilisation complet | UML |
| **sequence_passer_commande.puml** | Séquence complète de passage de commande | UML |
| **sequence_gestion_commande_staff.puml** | Gestion des commandes par le staff | UML |
| **sequence_parrainage.puml** | Processus de parrainage complet | UML |
| **activity_traitement_reclamation.puml** | Activité de traitement des réclamations | UML |
| **class_diagram.puml** | Diagramme de classes (Entités, Services, Controllers) | UML |

---

## 🔧 Installation des Outils

### Option 1 : Extension VS Code (Recommandé ⭐)

1. **Installer l'extension PlantUML** :
   - Ouvrir VS Code
   - Aller dans Extensions (Ctrl+Shift+X)
   - Rechercher "PlantUML"
   - Installer l'extension de **jebbs**

2. **Installer Java** (requis pour PlantUML) :
   ```powershell
   winget install --id=Oracle.JDK.21 -e
   ```

3. **Installer Graphviz** (pour les diagrammes complexes) :
   ```powershell
   winget install --id=Graphviz.Graphviz -e
   ```

4. **Redémarrer VS Code**

### Option 2 : PlantUML Desktop

```powershell
# Télécharger PlantUML JAR
Invoke-WebRequest -Uri "https://github.com/plantuml/plantuml/releases/download/v1.2024.3/plantuml-1.2024.3.jar" -OutFile "plantuml.jar"
```

### Option 3 : En ligne (Sans installation)

- **PlantUML Online** : https://www.plantuml.com/plantuml/uml/
- **PlantText** : https://www.planttext.com/

---

## 🖼️ Génération des Images

### Méthode 1 : Avec VS Code (Plus simple)

1. Ouvrir un fichier `.puml` dans VS Code
2. Appuyer sur **Alt+D** pour prévisualiser
3. Clic droit sur la prévisualisation → **Export Current Diagram**
4. Choisir le format :
   - **PNG** (pour documents Word/PowerPoint)
   - **SVG** (pour qualité vectorielle)
   - **PDF** (pour impression)

### Méthode 2 : Ligne de commande

```powershell
# Naviguer vers le dossier diagrammes
cd "c:\Users\Dorian Simo\Downloads\miam_miamBack\miam_miam\diagrammes"

# Générer tous les diagrammes en PNG
java -jar plantuml.jar -tpng *.puml

# Générer en SVG (haute qualité)
java -jar plantuml.jar -tsvg *.puml

# Générer en PDF
java -jar plantuml.jar -tpdf *.puml
```

### Méthode 3 : Script PowerShell automatisé

Créer un fichier `generer_diagrammes.ps1` :

```powershell
# Script de génération automatique
$diagrammesPath = "c:\Users\Dorian Simo\Downloads\miam_miamBack\miam_miam\diagrammes"
$outputPath = "$diagrammesPath\images"

# Créer dossier de sortie
New-Item -ItemType Directory -Force -Path $outputPath

# Générer PNG
Write-Host "Génération des PNG..." -ForegroundColor Green
java -jar plantuml.jar -tpng -o "$outputPath" "$diagrammesPath\*.puml"

# Générer SVG
Write-Host "Génération des SVG..." -ForegroundColor Green
java -jar plantuml.jar -tsvg -o "$outputPath" "$diagrammesPath\*.puml"

Write-Host "Terminé! Images générées dans: $outputPath" -ForegroundColor Cyan
```

Exécuter :
```powershell
.\generer_diagrammes.ps1
```

---

## 🎨 Création des Diagrammes MERISE avec Draw.io

### Installation Draw.io

**Option A : Application Desktop**
```powershell
winget install --id=JGraph.Draw -e
```

**Option B : Version Web**
- Aller sur : https://app.diagrams.net/

### Diagrammes MERISE à Créer

#### 1. **MCD (Modèle Conceptuel de Données)**

**Étapes** :

1. Ouvrir Draw.io
2. Nouveau diagramme → **Blank Diagram**
3. Dans la bibliothèque de gauche, chercher **"Entity Relation"**
4. Utiliser les formes :
   - **Rectangle** pour les entités
   - **Losange** pour les associations
   - **Ovale** pour les attributs

**Entités principales à dessiner** :

```
USER
├── #id_user (clé primaire)
├── nom
├── prenom
├── email
├── role
├── solde
└── points_fidelite

COMMANDE
├── #id_commande
├── numero_commande
├── date_commande
├── montant_total
└── statut

MENU
├── #id_article
├── nom
├── prix
└── disponible

PAIEMENT
├── #id_paiement
├── reference
├── montant
└── statut

EVENEMENT
├── #id_evenement
├── titre
├── code_promo
└── valeur_remise

PARRAINAGE
├── #id_parrainage
├── code_parrainage
└── statut
```

**Associations** :
- USER **PASSE** (1,N) COMMANDE
- COMMANDE **CONTIENT** (N,N) MENU
- COMMANDE **REGLE_PAR** (1,1) PAIEMENT
- USER **PARRAINE** (1,N) USER
- USER **PARTICIPE** (N,N) EVENEMENT

**Cardinalités** :
- `1,1` : un et un seul
- `0,1` : zéro ou un
- `1,N` : un ou plusieurs
- `0,N` : zéro ou plusieurs

#### 2. **MLD (Modèle Logique de Données)**

**Transformation MCD → MLD** :

1. Chaque **entité** devient une **table**
2. Chaque **association N,N** devient une **table de liaison**
3. Les **clés étrangères** sont ajoutées

**Exemple de table** :

```
COMMANDE
─────────────────────────────────
#id_commande : INT (PK)
 numero_commande : VARCHAR(50)
 id_user : INT (FK → USER)
 date_commande : TIMESTAMP
 montant_total : DECIMAL(10,2)
 statut : ENUM
─────────────────────────────────
Index: idx_commande_user (id_user)
```

#### 3. **MCT (Modèle Conceptuel des Traitements)**

**Structure** :

```
[ÉVÉNEMENT DÉCLENCHEUR]
         ↓
    [OPÉRATION 1]
         ↓
    [CONDITION] → OUI/NON
         ↓
    [OPÉRATION 2]
         ↓
  [ÉVÉNEMENT RÉSULTAT]
```

**Exemple : Passage de Commande**

```
┌─────────────────────────────┐
│ Étudiant sélectionne articles│
└──────────────┬──────────────┘
               ↓
┌──────────────────────────────┐
│ Calculer montant total       │
└──────────────┬───────────────┘
               ↓
        ┌──────▼──────┐
        │ Code promo? │
        └──┬───────┬──┘
      OUI  │       │ NON
           ↓       ↓
    ┌──────────┐  │
    │Appliquer │  │
    │ remise   │  │
    └─────┬────┘  │
          └───┬───┘
              ↓
    ┌─────────────────┐
    │ Créer commande  │
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │Initialiser      │
    │paiement CinetPay│
    └────────┬────────┘
             ↓
      ┌─────▼──────┐
      │Paiement OK?│
      └──┬──────┬──┘
    OUI  │      │ NON
         ↓      ↓
  ┌──────────┐ ┌────────┐
  │Confirmer │ │Annuler │
  │commande  │ │commande│
  └──────────┘ └────────┘
```

#### 4. **MOT (Modèle Organisationnel des Traitements)**

**Structure** : Qui fait quoi, quand, où ?

| Acteur | Opération | Quand | Où |
|--------|-----------|-------|-----|
| **Étudiant** | Sélectionne articles | Pendant heures ouverture | Application mobile/web |
| **Étudiant** | Valide commande | Après sélection | Application |
| **Système** | Calcule montant | Immédiatement | Serveur backend |
| **CinetPay** | Traite paiement | Après validation | API externe |
| **Système** | Enregistre commande | Après paiement | Base de données |
| **Système** | Notifie staff | Immédiatement | Email + Dashboard |
| **Employé** | Prépare commande | Dès réception | Cuisine |
| **Employé** | Change statut | Après préparation | Dashboard staff |
| **Système** | Notifie client | À chaque changement | Email + Push |

**Diagramme MOT dans Draw.io** :

Utiliser des **swimlanes** (couloirs) pour chaque acteur :

```
┌─────────────────────────────────────────────────────────┐
│                        ÉTUDIANT                         │
├─────────────────────────────────────────────────────────┤
│ [Sélectionne] → [Valide] → [Paie] → [Reçoit]          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                        SYSTÈME                          │
├─────────────────────────────────────────────────────────┤
│ [Calcule] → [Enregistre] → [Notifie] → [Attribue pts] │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                         STAFF                           │
├─────────────────────────────────────────────────────────┤
│ [Reçoit notif] → [Prépare] → [Valide] → [Livre]       │
└─────────────────────────────────────────────────────────┘
```

---

## 📐 Templates Draw.io Prêts à l'Emploi

### Template MCD

1. Télécharger le template : https://app.diagrams.net/?splash=0&libs=er
2. Utiliser la bibliothèque **Entity Relation**
3. Couleurs recommandées :
   - Entités : `#FFE6CC` (orange clair)
   - Associations : `#D5E8D4` (vert clair)
   - Attributs clés : `#F8CECC` (rouge clair)

### Template MOT

1. Utiliser **Cross-Functional Flowchart** (Swimlanes)
2. Créer 4 couloirs :
   - Étudiant : `#DAE8FC` (bleu)
   - Système : `#D5E8D4` (vert)
   - Staff : `#FFE6CC` (orange)
   - Externe : `#F8CECC` (rouge)

---

## 🎯 Checklist Complète des Diagrammes

### ✅ Diagrammes UML (PlantUML - Déjà créés)

- [x] Diagramme de cas d'utilisation
- [x] Diagramme de séquence - Passer commande
- [x] Diagramme de séquence - Gestion staff
- [x] Diagramme de séquence - Parrainage
- [x] Diagramme d'activité - Réclamation
- [x] Diagramme de classes

### 📝 Diagrammes MERISE (À créer avec Draw.io)

- [ ] **MCD** (Modèle Conceptuel de Données)
- [ ] **MLD** (Modèle Logique de Données)
- [ ] **MPD** (Modèle Physique de Données)
- [ ] **MCT** (Modèle Conceptuel des Traitements)
- [ ] **MOT** (Modèle Organisationnel des Traitements)
- [ ] **Diagramme de flux de données** (DFD Niveau 0, 1, 2)

---

## 🚀 Commandes Rapides

### Générer tous les diagrammes PlantUML

```powershell
# Aller dans le dossier
cd "c:\Users\Dorian Simo\Downloads\miam_miamBack\miam_miam\diagrammes"

# Générer PNG haute résolution
java -jar plantuml.jar -tpng -DPLANTUML_LIMIT_SIZE=16384 *.puml

# Générer SVG (vectoriel)
java -jar plantuml.jar -tsvg *.puml
```

### Prévisualiser dans VS Code

1. Ouvrir fichier `.puml`
2. **Alt+D** : Prévisualisation
3. **Ctrl+Shift+P** → "PlantUML: Export Current Diagram"

---

## 📊 Export pour la Soutenance

### Format recommandé par type de document

| Document | Format | Résolution |
|----------|--------|------------|
| **PowerPoint** | PNG | 300 DPI |
| **Word** | PNG | 300 DPI |
| **PDF** | SVG ou PDF | Vectoriel |
| **Web** | SVG | Vectoriel |
| **Impression** | PDF | Vectoriel |

### Tailles recommandées

- **Diagramme de cas d'utilisation** : 1920x1080 px
- **Diagrammes de séquence** : 1200x2400 px (portrait)
- **MCD** : 2400x1600 px (paysage)
- **MOT** : 2000x1200 px (paysage)

---

## 🎨 Personnalisation des Couleurs

### Thème Mon Miam Miam

Ajouter au début de vos fichiers `.puml` :

```plantuml
skinparam backgroundColor #FFFFFF
skinparam actorBackgroundColor #CFBD97
skinparam actorBorderColor #000000
skinparam usecaseBackgroundColor #F5F5DC
skinparam usecaseBorderColor #CFBD97
skinparam sequenceLifeLineBorderColor #CFBD97
skinparam sequenceParticipantBackgroundColor #F5F5DC
```

---

## 📚 Ressources Supplémentaires

- **PlantUML Documentation** : https://plantuml.com/fr/
- **Draw.io Tutorials** : https://www.diagrams.net/doc/
- **MERISE Guide** : http://merise.developpez.com/
- **UML Reference** : https://www.uml-diagrams.org/

---

## ✨ Conseils pour la Soutenance

1. **Préparer 2 versions** :
   - Version complète (détaillée)
   - Version simplifiée (pour présentation orale)

2. **Imprimer en A3** les diagrammes complexes (MCD, MOT)

3. **Créer un PDF unique** avec tous les diagrammes numérotés

4. **Préparer des zooms** sur les parties importantes

5. **Avoir une version interactive** (fichiers .puml et .drawio) pour démo live

---

**Version** : 1.0.0  
**Date** : Novembre 2024  
**Auteur** : Équipe Mon Miam Miam
