# 📐 MLD (Modèle Logique de Données) - Mon Miam Miam

## Instructions pour Draw.io

1. Ouvrir Draw.io : https://app.diagrams.net/
2. Nouveau diagramme → Blank Diagram
3. Utiliser des rectangles pour chaque table
4. Format : **NOM_TABLE** en haut, puis liste des attributs

---

## 🗂️ Tables du MLD

### USER
```
┌─────────────────────────────────────┐
│           USER                      │
├─────────────────────────────────────┤
│ #id_user : INT (PK)                 │
│  nom : VARCHAR(100)                 │
│  prenom : VARCHAR(100)              │
│  email : VARCHAR(150) UNIQUE        │
│  password : VARCHAR(255)            │
│  telephone : VARCHAR(20)            │
│  adresse : TEXT                     │
│  role : ENUM                        │
│  solde : DECIMAL(10,2)              │
│  points_fidelite : INT              │
│  code_parrainage : VARCHAR(20) UQ   │
│  email_verified_at : TIMESTAMP      │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ INDEX: idx_user_email (email)       │
│ INDEX: idx_user_role (role)         │
└─────────────────────────────────────┘
```

### COMMANDE
```
┌─────────────────────────────────────┐
│           COMMANDE                  │
├─────────────────────────────────────┤
│ #id_commande : INT (PK)             │
│  numero_commande : VARCHAR(50) UQ   │
│  id_user : INT (FK → USER)          │
│  date_commande : TIMESTAMP          │
│  montant_total : DECIMAL(10,2)      │
│  statut : ENUM                      │
│  type_livraison : ENUM              │
│  heure_arrivee : TIME               │
│  adresse_livraison : TEXT           │
│  commentaire_client : TEXT          │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_user → USER(id_user)         │
│ INDEX: idx_commande_user (id_user)  │
│ INDEX: idx_commande_statut (statut) │
└─────────────────────────────────────┘
```

### DETAIL_COMMANDE
```
┌─────────────────────────────────────┐
│        DETAIL_COMMANDE              │
├─────────────────────────────────────┤
│ #id_detail_commande : INT (PK)      │
│  id_commande : INT (FK → COMMANDE)  │
│  id_article : INT (FK → MENU)       │
│  quantite : INT                     │
│  prix_unitaire : DECIMAL(10,2)      │
│  sous_total : DECIMAL(10,2)         │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_commande → COMMANDE          │
│ FK: id_article → MENU               │
│ INDEX: idx_detail_commande          │
│ INDEX: idx_detail_article           │
└─────────────────────────────────────┘
```

### MENU
```
┌─────────────────────────────────────┐
│             MENU                    │
├─────────────────────────────────────┤
│ #id_article : INT (PK)              │
│  nom : VARCHAR(200)                 │
│  description : TEXT                 │
│  prix : DECIMAL(10,2)               │
│  image : VARCHAR(255)               │
│  id_categorie : INT (FK → CATEGORIE)│
│  disponible : BOOLEAN               │
│  temps_preparation : INT            │
│  valeur_nutritionnelle : TEXT       │
│  ingredients : TEXT                 │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_categorie → CATEGORIE_MENU   │
│ INDEX: idx_menu_categorie           │
│ INDEX: idx_menu_disponible          │
└─────────────────────────────────────┘
```

### CATEGORIE_MENU
```
┌─────────────────────────────────────┐
│        CATEGORIE_MENU               │
├─────────────────────────────────────┤
│ #id_categorie : INT (PK)            │
│  nom : VARCHAR(100)                 │
│  description : TEXT                 │
│  image : VARCHAR(255)               │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
└─────────────────────────────────────┘
```

### STOCK
```
┌─────────────────────────────────────┐
│            STOCK                    │
├─────────────────────────────────────┤
│ #id_stock : INT (PK)                │
│  id_article : INT (FK → MENU) UQ    │
│  quantite : INT                     │
│  unite : VARCHAR(50)                │
│  date_mise_a_jour : TIMESTAMP       │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_article → MENU (UNIQUE)      │
└─────────────────────────────────────┘
```

### PAIEMENT
```
┌─────────────────────────────────────┐
│           PAIEMENT                  │
├─────────────────────────────────────┤
│ #id_paiement : INT (PK)             │
│  id_commande : INT (FK → COMMANDE)  │
│  id_user : INT (FK → USER)          │
│  reference : VARCHAR(100) UNIQUE    │
│  montant : DECIMAL(10,2)            │
│  methode : ENUM                     │
│  statut : ENUM                      │
│  transaction_id : VARCHAR(255)      │
│  date_paiement : TIMESTAMP          │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_commande → COMMANDE          │
│ FK: id_user → USER                  │
│ INDEX: idx_paiement_commande        │
│ INDEX: idx_paiement_user            │
└─────────────────────────────────────┘
```

### RECLAMATION
```
┌─────────────────────────────────────┐
│         RECLAMATION                 │
├─────────────────────────────────────┤
│ #id_reclamation : INT (PK)          │
│  id_user : INT (FK → USER)          │
│  objet : VARCHAR(255)               │
│  message : TEXT                     │
│  statut : ENUM                      │
│  reponse : TEXT                     │
│  date_reponse : TIMESTAMP           │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_user → USER                  │
│ INDEX: idx_reclamation_user         │
│ INDEX: idx_reclamation_statut       │
└─────────────────────────────────────┘
```

### EVENEMENT
```
┌─────────────────────────────────────┐
│          EVENEMENT                  │
├─────────────────────────────────────┤
│ #id_evenement : INT (PK)            │
│  titre : VARCHAR(255)               │
│  description : TEXT                 │
│  type : ENUM                        │
│  code_promo : VARCHAR(50)           │
│  valeur_remise : DECIMAL(10,2)      │
│  type_remise : ENUM                 │
│  date_debut : DATE                  │
│  date_fin : DATE                    │
│  active : ENUM                      │
│  affiche : VARCHAR(255)             │
│  recompense_points : INT            │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ INDEX: idx_evenement_actif          │
│ INDEX: idx_evenement_dates          │
└─────────────────────────────────────┘
```

### PARRAINAGE
```
┌─────────────────────────────────────┐
│          PARRAINAGE                 │
├─────────────────────────────────────┤
│ #id_parrainage : INT (PK)           │
│  id_parrain : INT (FK → USER)       │
│  id_filleul : INT (FK → USER)       │
│  code_parrainage : VARCHAR(20)      │
│  date_parrainage : TIMESTAMP        │
│  statut : ENUM                      │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_parrain → USER(id_user)      │
│ FK: id_filleul → USER(id_user)      │
│ INDEX: idx_parrainage_parrain       │
│ INDEX: idx_parrainage_filleul       │
└─────────────────────────────────────┘
```

### SUIVI_POINT
```
┌─────────────────────────────────────┐
│         SUIVI_POINT                 │
├─────────────────────────────────────┤
│ #id_suivi_point : INT (PK)          │
│  id_user : INT (FK → USER)          │
│  type_transaction : ENUM            │
│  points : INT                       │
│  source : ENUM                      │
│  description : TEXT                 │
│  id_reference : INT                 │
│  date_transaction : TIMESTAMP       │
│  created_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_user → USER                  │
│ INDEX: idx_suivi_user               │
│ INDEX: idx_suivi_date               │
└─────────────────────────────────────┘
```

### EMPLOYE
```
┌─────────────────────────────────────┐
│           EMPLOYE                   │
├─────────────────────────────────────┤
│ #id_employe : INT (PK)              │
│  id_user : INT (FK → USER) UNIQUE   │
│  poste : ENUM                       │
│  date_embauche : DATE               │
│  salaire : DECIMAL(10,2)            │
│  statut_emploi : ENUM               │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_user → USER (UNIQUE)         │
└─────────────────────────────────────┘
```

### ACTIVITE
```
┌─────────────────────────────────────┐
│          ACTIVITE                   │
├─────────────────────────────────────┤
│ #id_activite : INT (PK)             │
│  id_employe : INT (FK → EMPLOYE)    │
│  type_activite : ENUM               │
│  description : TEXT                 │
│  ip_address : VARCHAR(45)           │
│  date_activite : TIMESTAMP          │
│  created_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_employe → EMPLOYE            │
│ INDEX: idx_activite_employe         │
│ INDEX: idx_activite_date            │
└─────────────────────────────────────┘
```

### PARTICIPATION_EVENEMENT
```
┌─────────────────────────────────────┐
│    PARTICIPATION_EVENEMENT          │
├─────────────────────────────────────┤
│ #id_participation : INT (PK)        │
│  id_user : INT (FK → USER)          │
│  id_evenement : INT (FK → EVENEMENT)│
│  date_participation : TIMESTAMP     │
│  statut : ENUM                      │
│  created_at : TIMESTAMP             │
│  updated_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_user → USER                  │
│ FK: id_evenement → EVENEMENT        │
│ UNIQUE: (id_user, id_evenement)     │
└─────────────────────────────────────┘
```

### USAGE_PROMO
```
┌─────────────────────────────────────┐
│         USAGE_PROMO                 │
├─────────────────────────────────────┤
│ #id_usage_promo : INT (PK)          │
│  id_user : INT (FK → USER)          │
│  id_evenement : INT (FK → EVENEMENT)│
│  id_commande : INT (FK → COMMANDE)  │
│  code_utilise : VARCHAR(50)         │
│  montant_economise : DECIMAL(10,2)  │
│  date_utilisation : TIMESTAMP       │
│  created_at : TIMESTAMP             │
├─────────────────────────────────────┤
│ FK: id_user → USER                  │
│ FK: id_evenement → EVENEMENT        │
│ FK: id_commande → COMMANDE          │
│ INDEX: idx_usage_user               │
│ INDEX: idx_usage_evenement          │
└─────────────────────────────────────┘
```

---

## 🔗 Relations (Flèches dans Draw.io)

```
USER ──1──────N── COMMANDE
USER ──1──────N── PAIEMENT
USER ──1──────N── RECLAMATION
USER ──1──────N── SUIVI_POINT
USER ──1──────N── PARRAINAGE (parrain)
USER ──1──────N── PARRAINAGE (filleul)
USER ──1──────1── EMPLOYE
USER ──1──────N── PARTICIPATION_EVENEMENT
USER ──1──────N── USAGE_PROMO

COMMANDE ──1──────N── DETAIL_COMMANDE
COMMANDE ──1──────1── PAIEMENT
COMMANDE ──1──────1── USAGE_PROMO

MENU ──1──────N── DETAIL_COMMANDE
MENU ──1──────1── STOCK
MENU ──N──────1── CATEGORIE_MENU

EVENEMENT ──1──────N── PARTICIPATION_EVENEMENT
EVENEMENT ──1──────N── USAGE_PROMO

EMPLOYE ──1──────N── ACTIVITE
```

---

## 📝 Légende

- **#** = Clé primaire (PK)
- **FK** = Clé étrangère (Foreign Key)
- **UQ** = Contrainte d'unicité (UNIQUE)
- **1** = Cardinalité un
- **N** = Cardinalité plusieurs

---

**Total : 15 tables**
