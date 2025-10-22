-- ============================================
-- Script d'adaptation pour base existante
-- Compatible avec Laravel
-- ============================================

-- 1. Renommer la table utilisateur en users (si elle existe)
-- ALTER TABLE utilisateur RENAME TO users;

-- 2. Ajouter les colonnes manquantes à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_parrainage VARCHAR(10) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_parrain BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS point_fidelite INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS statut VARCHAR(10) DEFAULT 'actif';
ALTER TABLE users ADD COLUMN IF NOT EXISTS localisation TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3. Renommer les colonnes pour correspondre à Laravel
-- ALTER TABLE users RENAME COLUMN mot_de_passe_hash TO mot_de_passe;
-- ALTER TABLE users RENAME COLUMN status_compte TO statut;
-- ALTER TABLE users RENAME COLUMN points_fidelite TO point_fidelite;
-- ALTER TABLE users RENAME COLUMN date_inscription TO date_creation;

-- 4. Créer les tables manquantes pour Laravel
CREATE TABLE IF NOT EXISTS categories_menu (
    id_categorie SERIAL PRIMARY KEY,
    nom_categorie VARCHAR(60) UNIQUE NOT NULL,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menus (
    id_article SERIAL PRIMARY KEY,
    id_categorie BIGINT REFERENCES categories_menu(id_categorie),
    nom_article VARCHAR(100) NOT NULL,
    description TEXT,
    prix DECIMAL(12,2) NOT NULL,
    disponible VARCHAR(3) DEFAULT 'oui',
    temps_preparation INTEGER,
    url_image VARCHAR(500),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commandes (
    id_commande SERIAL PRIMARY KEY,
    id_utilisateur BIGINT REFERENCES users(id_utilisateur),
    type_livraison VARCHAR(20) NOT NULL,
    heure_arrivee TIME,
    adresse_livraison TEXT,
    statut_commande VARCHAR(20) DEFAULT 'en_attente',
    commentaire_client TEXT,
    commentaire_livraison TEXT,
    montant_total DECIMAL(12,2) DEFAULT 0,
    montant_remise DECIMAL(12,2) DEFAULT 0,
    montant_final DECIMAL(12,2) DEFAULT 0,
    points_utilises INTEGER DEFAULT 0,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insérer les données de base
INSERT INTO categories_menu (nom_categorie, description) VALUES
('Pizzas', 'Pizzas variées'),
('Burgers', 'Burgers et sandwiches'),
('Plats', 'Plats principaux'),
('Boissons', 'Boissons et jus'),
('Desserts', 'Desserts et glaces')
ON CONFLICT (nom_categorie) DO NOTHING;

-- 6. Insérer le menu
INSERT INTO menus (id_categorie, nom_article, description, prix, disponible, temps_preparation) VALUES
(1, 'Pizza Margherita', 'Pizza avec tomate, mozzarella et basilic', 1500, 'oui', 20),
(1, 'Pizza Pepperoni', 'Pizza avec pepperoni et fromage', 1800, 'oui', 20),
(1, 'Pizza 4 Fromages', 'Pizza avec 4 types de fromages', 2000, 'oui', 25),
(2, 'Burger Classique', 'Burger avec steak, salade, tomate et oignons', 1200, 'oui', 15),
(2, 'Burger Chicken', 'Burger avec poulet pané et salade', 1400, 'oui', 15),
(3, 'Poulet Rôti', 'Poulet rôti avec frites et salade', 1600, 'oui', 30),
(3, 'Poisson Braisé', 'Poisson braisé avec plantain et légumes', 1800, 'oui', 25),
(3, 'Riz au Poulet', 'Riz parfumé avec poulet et légumes', 1000, 'oui', 20),
(4, 'Coca-Cola', 'Boisson gazeuse 33cl', 500, 'oui', 5),
(4, 'Fanta Orange', 'Boisson gazeuse orange 33cl', 500, 'oui', 5),
(4, 'Eau Minérale', 'Eau minérale 50cl', 300, 'oui', 2),
(5, 'Glace Vanille', 'Glace à la vanille', 600, 'oui', 5),
(5, 'Glace Chocolat', 'Glace au chocolat', 600, 'oui', 5)
ON CONFLICT DO NOTHING;

-- 7. Mettre à jour les utilisateurs existants avec les codes de parrainage
UPDATE users SET 
    code_parrainage = 'ADMIN2024',
    statut = 'actif'
WHERE email = 'admin@zeducspace.com';

UPDATE users SET 
    code_parrainage = 'GERANT2024',
    statut = 'actif'
WHERE email = 'gerant@zeducspace.com';

UPDATE users SET 
    code_parrainage = 'KOUAM2024',
    statut = 'actif'
WHERE email = 'kouam.jean@student.ucac-icam.cm';

UPDATE users SET 
    code_parrainage = 'NGO2024',
    statut = 'actif'
WHERE email = 'ngo.marie@student.ucac-icam.cm';

UPDATE users SET 
    code_parrainage = 'FOTSO2024',
    statut = 'actif'
WHERE email = 'fotso.paul@student.ucac-icam.cm';

UPDATE users SET 
    code_parrainage = 'TCHOUMI24',
    statut = 'actif'
WHERE email = 'tchoumi.grace@student.ucac-icam.cm';

UPDATE users SET 
    code_parrainage = 'MBALLA2024',
    statut = 'actif'
WHERE email = 'mballa.david@student.ucac-icam.cm';

UPDATE users SET 
    code_parrainage = 'NGONO2024',
    statut = 'actif'
WHERE email = 'ngono.sarah@student.ucac-icam.cm';

UPDATE users SET 
    code_parrainage = 'TCHAK2024',
    statut = 'actif'
WHERE email = 'tchakounte.junior@student.ucac-icam.cm';

UPDATE users SET 
    code_parrainage = 'NGUEMA2024',
    statut = 'actif'
WHERE email = 'nguema.patricia@student.ucac-icam.cm';
