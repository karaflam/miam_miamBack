-- Script pour vérifier et corriger les rôles dans la base de données

-- 1. Vérifier les rôles existants
SELECT * FROM zeduc_schema.roles ORDER BY id_role;

-- 2. Vérifier les employés et leurs rôles
SELECT 
    e.id_employe,
    e.nom,
    e.prenom,
    e.email,
    r.id_role,
    r.nom_role,
    e.actif
FROM zeduc_schema.employes e
LEFT JOIN zeduc_schema.roles r ON e.id_role = r.id_role
ORDER BY e.id_employe;

-- 3. Si les rôles n'existent pas, les créer
-- Décommenter et exécuter si nécessaire

-- INSERT INTO zeduc_schema.roles (nom_role, description, date_creation) VALUES
-- ('Administrateur', 'Accès complet au système', NOW()),
-- ('Gérant', 'Gestion du restaurant et des employés', NOW()),
-- ('Employé', 'Gestion des commandes et du menu', NOW())
-- ON CONFLICT (nom_role) DO NOTHING;

-- 4. Mettre à jour les employés avec les bons rôles
-- Exemple : Mettre à jour un employé spécifique
-- UPDATE zeduc_schema.employes 
-- SET id_role = (SELECT id_role FROM zeduc_schema.roles WHERE nom_role = 'Employé')
-- WHERE email = 'votre.email@example.com';

-- 5. Vérifier les tokens actifs
SELECT 
    e.email,
    r.nom_role,
    t.name as token_name,
    t.created_at,
    t.last_used_at
FROM zeduc_schema.personal_access_tokens t
JOIN zeduc_schema.employes e ON t.tokenable_id = e.id_employe
LEFT JOIN zeduc_schema.roles r ON e.id_role = r.id_role
WHERE t.tokenable_type = 'App\\Models\\Employe'
ORDER BY t.created_at DESC
LIMIT 10;
