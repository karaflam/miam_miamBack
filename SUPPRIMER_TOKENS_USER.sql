-- Voir tous les tokens actuels
SELECT 
    id,
    tokenable_type,
    tokenable_id,
    name,
    created_at
FROM zeduc_schema.personal_access_tokens
ORDER BY created_at DESC;

-- Supprimer TOUS les tokens de User (étudiants)
DELETE FROM zeduc_schema.personal_access_tokens 
WHERE tokenable_type = 'App\Models\User';

-- Vérifier qu'il ne reste que les tokens Employe (s'il y en a)
SELECT 
    id,
    tokenable_type,
    tokenable_id,
    name,
    created_at
FROM zeduc_schema.personal_access_tokens;

-- Si vous voulez tout supprimer (déconnecte tout le monde)
-- TRUNCATE TABLE personal_access_tokens;
-- Supprimer TOUS les tokens
DELETE FROM zeduc_schema.personal_access_tokens 
WHERE tokenable_type = 'App\\Models\\User';

-- Ou supprimer TOUS les tokens (recommandé)
TRUNCATE TABLE zeduc_schema.personal_access_tokens;
