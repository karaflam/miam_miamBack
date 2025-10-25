-- Vérifier les tokens actifs
SELECT 
    id,
    tokenable_type,
    tokenable_id,
    name,
    created_at
FROM zeduc_schema.personal_access_tokens
ORDER BY created_at DESC
LIMIT 10;

-- Vérifier les employés
SELECT id_employe, nom, prenom, email FROM zeduc_schema.employes;

-- Vérifier les utilisateurs (students)
SELECT id_utilisateur, nom, prenom, email FROM zeduc_schema.users;

-- Trouver le token le plus récent
SELECT * FROM zeduc_schema.personal_access_tokens 
ORDER BY created_at DESC 
LIMIT 1;
