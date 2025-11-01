# 🗄️ Schéma Base de Données - Mon Miam Miam

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Diagramme ERD](#diagramme-erd)
3. [Tables Détaillées](#tables-détaillées)
4. [Relations](#relations)
5. [Index et Performances](#index-et-performances)
6. [Requêtes SQL Utiles](#requêtes-sql-utiles)

---

## 🎯 Vue d'ensemble

**SGBD** : MySQL 8.0  
**Charset** : utf8mb4_unicode_ci  
**Engine** : InnoDB  
**Total Tables** : 19

### Catégories de Tables

| Catégorie | Tables |
|-----------|--------|
| **Authentification** | users, roles, personal_access_tokens |
| **Menu** | categories_menu, menus, stocks |
| **Commandes** | commandes, details_commandes, paiements |
| **Fidélité** | suivi_points, parrainages |
| **Événements** | evenements, participation_evenement, usage_promo |
| **Réclamations** | reclamations |
| **Staff** | employes, permissions, activites |
| **RGPD** | consentements |
| **Système** | cache, jobs |

---

## 📊 Diagramme ERD (Simplifié)

```
┌─────────┐     1:N    ┌──────────┐     N:1    ┌──────────────┐
│  users  │────────────│commandes │────────────│details_com...│
└────┬────┘            └────┬─────┘            └──────┬───────┘
     │                      │                         │
     │ 1:N                  │ 1:1                     │ N:1
     │                      │                         │
┌────▼────┐           ┌─────▼─────┐          ┌───────▼──────┐
│parraina │           │ paiements │          │    menus     │
│  -ges   │           └───────────┘          └──────┬───────┘
└─────────┘                                         │ N:1
     │                                              │
     │ 1:N                                   ┌──────▼─────────┐
┌────▼────┐                                  │categories_menu │
│suivi_   │                                  └────────────────┘
│points   │
└─────────┘
```

---

## 📑 Tables Détaillées

### 1. **users** (Utilisateurs/Étudiants)

Table principale des utilisateurs étudiants.

```sql
CREATE TABLE users (
    id_user BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NULL,
    adresse TEXT NULL,
    role ENUM('student', 'employee', 'manager', 'admin') DEFAULT 'student',
    solde DECIMAL(10,2) DEFAULT 0.00,
    points_fidelite INT DEFAULT 0,
    code_parrainage VARCHAR(20) UNIQUE NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Index :**
- PRIMARY KEY (`id_user`)
- UNIQUE (`email`, `code_parrainage`)
- INDEX (`role`)

---

### 2. **employes** (Employés)

Table des employés du restaurant.

```sql
CREATE TABLE employes (
    id_employe BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NULL,
    poste VARCHAR(100) NULL,
    role ENUM('employee', 'manager', 'admin') DEFAULT 'employee',
    date_embauche DATE NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

---

### 3. **categories_menu** (Catégories)

```sql
CREATE TABLE categories_menu (
    id_categorie BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Exemples de catégories :**
- Plats Principaux
- Accompagnements
- Boissons
- Desserts

---

### 4. **menus** (Articles du Menu)

```sql
CREATE TABLE menus (
    id_article BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    description TEXT NULL,
    prix DECIMAL(10,2) NOT NULL,
    image VARCHAR(255) NULL,
    id_categorie BIGINT UNSIGNED NULL,
    disponible BOOLEAN DEFAULT TRUE,
    temps_preparation INT NULL COMMENT 'en minutes',
    valeur_nutritionnelle VARCHAR(255) NULL,
    ingredients TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_categorie) REFERENCES categories_menu(id_categorie) 
        ON DELETE SET NULL
);
```

**Index :**
- INDEX (`id_categorie`, `disponible`)

---

### 5. **stocks** (Gestion Stocks)

```sql
CREATE TABLE stocks (
    id_stock BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_article BIGINT UNSIGNED NOT NULL,
    quantite_disponible INT DEFAULT 0,
    seuil_alerte INT DEFAULT 10,
    derniere_mise_a_jour TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_article) REFERENCES menus(id_article) 
        ON DELETE CASCADE
);
```

---

### 6. **commandes** (Commandes)

```sql
CREATE TABLE commandes (
    id_commande BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_user BIGINT UNSIGNED NOT NULL,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(10,2) NOT NULL,
    statut ENUM('en_attente', 'en_preparation', 'prete', 'livree', 'annulee') 
        DEFAULT 'en_attente',
    type_livraison ENUM('livraison', 'sur_place') NOT NULL,
    heure_arrivee TIME NULL,
    adresse_livraison TEXT NULL,
    commentaire_client TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_user) REFERENCES users(id_user) 
        ON DELETE CASCADE
);
```

**Index :**
- INDEX (`id_user`, `statut`)
- INDEX (`date_commande`)

**Génération numero_commande :**
```php
'CMD-' . date('Ymd') . '-' . str_pad($id, 4, '0', STR_PAD_LEFT)
// Exemple: CMD-20241101-0123
```

---

### 7. **details_commandes** (Détails Commandes)

```sql
CREATE TABLE details_commandes (
    id_detail BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_commande BIGINT UNSIGNED NOT NULL,
    id_article BIGINT UNSIGNED NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    sous_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande) 
        ON DELETE CASCADE,
    FOREIGN KEY (id_article) REFERENCES menus(id_article) 
        ON DELETE CASCADE
);
```

---

### 8. **paiements** (Transactions)

```sql
CREATE TABLE paiements (
    id_paiement BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_commande BIGINT UNSIGNED NULL,
    id_user BIGINT UNSIGNED NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    methode ENUM('cash', 'mobile_money', 'orange_money', 'mtn_money', 'carte', 'points_fidelite') NOT NULL,
    statut ENUM('en_attente', 'reussi', 'echoue', 'rembourse') DEFAULT 'en_attente',
    transaction_id VARCHAR(100) UNIQUE NULL,
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande) 
        ON DELETE SET NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user) 
        ON DELETE CASCADE
);
```

---

### 9. **suivi_points** (Historique Points Fidélité)

```sql
CREATE TABLE suivi_points (
    id_suivi BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_user BIGINT UNSIGNED NOT NULL,
    type_transaction ENUM('gain', 'utilisation', 'expiration') NOT NULL,
    points INT NOT NULL,
    source ENUM('commande', 'parrainage', 'evenement', 'bonus', 'reduction') NOT NULL,
    description TEXT NULL,
    id_reference BIGINT UNSIGNED NULL COMMENT 'ID commande, parrainage, etc.',
    date_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_user) REFERENCES users(id_user) 
        ON DELETE CASCADE
);
```

**Règle de calcul :**
- 1000 FCFA dépensés = 1 point
- 100 points = 1000 FCFA de réduction

---

### 10. **parrainages** (Système Parrainage)

```sql
CREATE TABLE parrainages (
    id_parrainage BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_parrain BIGINT UNSIGNED NOT NULL COMMENT 'Celui qui parraine',
    id_filleu BIGINT UNSIGNED NOT NULL COMMENT 'Celui qui est parrainé',
    code_parrainage VARCHAR(20) NOT NULL,
    points_parrain INT DEFAULT 50,
    points_filleul INT DEFAULT 25,
    date_parrainage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_parrain) REFERENCES users(id_user) 
        ON DELETE CASCADE,
    FOREIGN KEY (id_filleu) REFERENCES users(id_user) 
        ON DELETE CASCADE,
    UNIQUE KEY unique_filleul (id_filleu)
);
```

---

### 11. **evenements** (Promotions/Événements/Jeux)

```sql
CREATE TABLE evenements (
    id_evenement BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(255) NOT NULL,
    description TEXT NULL,
    type ENUM('promotion', 'evenement', 'jeu') NOT NULL,
    code_promo VARCHAR(50) UNIQUE NULL,
    valeur_remise DECIMAL(10,2) NULL,
    type_remise ENUM('pourcentage', 'montant_fixe') NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    active ENUM('oui', 'non') DEFAULT 'non',
    affiche VARCHAR(255) NULL,
    recompense_points INT NULL,
    is_integrated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Exemples :**
- **Promotion** : -20% sur tous les plats (code: WEEK20)
- **Événement** : Match Champions League
- **Jeu** : Roue de la Fortune (10 points gagnables)

---

### 12. **participation_evenement**

```sql
CREATE TABLE participation_evenement (
    id_participation BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_user BIGINT UNSIGNED NOT NULL,
    id_evenement BIGINT UNSIGNED NOT NULL,
    date_participation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points_gagnes INT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_user) REFERENCES users(id_user) 
        ON DELETE CASCADE,
    FOREIGN KEY (id_evenement) REFERENCES evenements(id_evenement) 
        ON DELETE CASCADE,
    UNIQUE KEY unique_participation (id_user, id_evenement)
);
```

---

### 13. **usage_promo** (Utilisation Codes Promo)

```sql
CREATE TABLE usage_promo (
    id_usage BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_user BIGINT UNSIGNED NOT NULL,
    id_evenement BIGINT UNSIGNED NOT NULL,
    id_commande BIGINT UNSIGNED NOT NULL,
    code_utilise VARCHAR(50) NOT NULL,
    montant_reduction DECIMAL(10,2) NOT NULL,
    date_utilisation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_user) REFERENCES users(id_user) 
        ON DELETE CASCADE,
    FOREIGN KEY (id_evenement) REFERENCES evenements(id_evenement) 
        ON DELETE CASCADE,
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande) 
        ON DELETE CASCADE
);
```

---

### 14. **reclamations** (Réclamations)

```sql
CREATE TABLE reclamations (
    id_reclamation BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    numero_reclamation VARCHAR(50) UNIQUE NOT NULL,
    id_user BIGINT UNSIGNED NOT NULL,
    id_commande BIGINT UNSIGNED NULL,
    type_reclamation ENUM('qualite_produit', 'delai_livraison', 'service_client', 'erreur_commande', 'autre') NOT NULL,
    description TEXT NOT NULL,
    statut ENUM('en_attente', 'en_traitement', 'traitee', 'rejetee') 
        DEFAULT 'en_attente',
    priorite ENUM('basse', 'moyenne', 'haute') DEFAULT 'moyenne',
    id_employe_assigne BIGINT UNSIGNED NULL,
    reponse_employe TEXT NULL,
    date_resolution TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_user) REFERENCES users(id_user) 
        ON DELETE CASCADE,
    FOREIGN KEY (id_commande) REFERENCES commandes(id_commande) 
        ON DELETE SET NULL
);
```

---

### 15. **activites** (Logs d'Activités)

```sql
CREATE TABLE activites (
    id_activite BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_user BIGINT UNSIGNED NULL,
    id_employe BIGINT UNSIGNED NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_user) REFERENCES users(id_user) 
        ON DELETE SET NULL
);
```

**Exemples d'actions :**
- login, logout
- commande_creee, commande_annulee
- paiement_reussi, paiement_echoue
- menu_modifie, menu_supprime

---

### 16. **consentements** (RGPD)

```sql
CREATE TABLE consentements (
    id_consentement BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_user BIGINT UNSIGNED NOT NULL,
    type VARCHAR(100) NOT NULL COMMENT 'cookies, marketing, etc.',
    accepte BOOLEAN DEFAULT FALSE,
    date_consentement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (id_user) REFERENCES users(id_user) 
        ON DELETE CASCADE
);
```

---

### 17. **personal_access_tokens** (Sanctum)

```sql
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX (tokenable_type, tokenable_id)
);
```

---

## 🔗 Relations Principales

### Users ↔ Commandes (1:N)
Un utilisateur peut avoir plusieurs commandes.

```sql
SELECT u.nom, COUNT(c.id_commande) as nb_commandes
FROM users u
LEFT JOIN commandes c ON u.id_user = c.id_user
GROUP BY u.id_user;
```

### Commandes ↔ Details (1:N)
Une commande contient plusieurs articles.

```sql
SELECT c.numero_commande, m.nom, dc.quantite, dc.sous_total
FROM commandes c
JOIN details_commandes dc ON c.id_commande = dc.id_commande
JOIN menus m ON dc.id_article = m.id_article
WHERE c.id_commande = 123;
```

### Users ↔ Parrainages (1:N)
Un utilisateur peut parrainer plusieurs personnes.

```sql
SELECT u.nom as parrain, COUNT(p.id_filleu) as nb_filleuls
FROM users u
LEFT JOIN parrainages p ON u.id_user = p.id_parrain
GROUP BY u.id_user;
```

---

## ⚡ Index et Performances

### Index Recommandés

```sql
-- Performance commandes
CREATE INDEX idx_commandes_user_statut ON commandes(id_user, statut);
CREATE INDEX idx_commandes_date ON commandes(date_commande);

-- Performance menu
CREATE INDEX idx_menu_categorie ON menus(id_categorie, disponible);

-- Performance points
CREATE INDEX idx_suivi_points_user ON suivi_points(id_user, date_transaction);

-- Performance recherche
CREATE FULLTEXT INDEX idx_menu_search ON menus(nom, description);
```

---

## 💡 Requêtes SQL Utiles

### Top 10 Clients du Mois

```sql
SELECT 
    u.id_user,
    CONCAT(u.prenom, ' ', u.nom) as nom_complet,
    u.points_fidelite,
    SUM(c.montant_total) as total_depense,
    COUNT(c.id_commande) as nombre_commandes
FROM users u
JOIN commandes c ON u.id_user = c.id_user
WHERE c.date_commande >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND c.statut != 'annulee'
GROUP BY u.id_user
ORDER BY total_depense DESC
LIMIT 10;
```

### CA Journalier par Statut

```sql
SELECT 
    DATE(date_commande) as jour,
    statut,
    COUNT(*) as nb_commandes,
    SUM(montant_total) as ca
FROM commandes
WHERE date_commande >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(date_commande), statut
ORDER BY jour DESC;
```

### Plats les Plus Vendus

```sql
SELECT 
    m.nom,
    m.prix,
    SUM(dc.quantite) as total_vendus,
    SUM(dc.sous_total) as ca_total
FROM menus m
JOIN details_commandes dc ON m.id_article = dc.id_article
JOIN commandes c ON dc.id_commande = c.id_commande
WHERE c.statut = 'livree'
GROUP BY m.id_article
ORDER BY total_vendus DESC
LIMIT 10;
```

### Alertes Stock

```sql
SELECT 
    m.nom,
    s.quantite_disponible,
    s.seuil_alerte
FROM stocks s
JOIN menus m ON s.id_article = m.id_article
WHERE s.quantite_disponible <= s.seuil_alerte
ORDER BY s.quantite_disponible ASC;
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2024
