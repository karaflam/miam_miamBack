-- Script SQL pour vérifier les tokens et l'authentification staff
-- Exécuter dans votre client PostgreSQL

-- 1. Vérifier les rôles existants
SELECT 
    id_role,
    nom_role,
    description
FROM roles
ORDER BY id_role;

-- 2. Vérifier les employés et leurs rôles
SELECT 
    e.id_employe,
    e.nom,
    e.prenom,
    e.email,
    e.actif,
    r.nom_role as role,
    e.date_embauche,
    e.date_creation
FROM employes e
LEFT JOIN roles r ON e.id_role = r.id_role
ORDER BY e.id_employe;

-- 3. Vérifier les tokens actifs pour les employés
SELECT 
    pat.id,
    pat.tokenable_type,
    pat.tokenable_id,
    e.nom,
    e.prenom,
    e.email,
    r.nom_role,
    pat.name as token_name,
    pat.abilities,
    pat.created_at,
    pat.last_used_at,
    pat.expires_at
FROM personal_access_tokens pat
JOIN employes e ON pat.tokenable_id = e.id_employe AND pat.tokenable_type = 'App\Models\Employe'
LEFT JOIN roles r ON e.id_role = r.id_role
ORDER BY pat.created_at DESC
LIMIT 10;

-- 4. Compter les tokens par employé
SELECT 
    e.email,
    e.nom,
    e.prenom,
    r.nom_role,
    COUNT(pat.id) as nombre_tokens
FROM employes e
LEFT JOIN personal_access_tokens pat ON pat.tokenable_id = e.id_employe AND pat.tokenable_type = 'App\Models\Employe'
LEFT JOIN roles r ON e.id_role = r.id_role
GROUP BY e.id_employe, e.email, e.nom, e.prenom, r.nom_role
ORDER BY nombre_tokens DESC;

-- 5. Vérifier les tokens expirés
SELECT 
    pat.id,
    e.email,
    e.nom,
    r.nom_role,
    pat.created_at,
    pat.expires_at,
    CASE 
        WHEN pat.expires_at IS NULL THEN 'Jamais'
        WHEN pat.expires_at < NOW() THEN 'Expiré'
        ELSE 'Valide'
    END as statut
FROM personal_access_tokens pat
JOIN employes e ON pat.tokenable_id = e.id_employe AND pat.tokenable_type = 'App\Models\Employe'
LEFT JOIN roles r ON e.id_role = r.id_role
ORDER BY pat.created_at DESC
LIMIT 10;

-- 6. Supprimer les vieux tokens (plus de 30 jours)
-- ATTENTION: Décommenter uniquement si vous voulez vraiment supprimer
-- DELETE FROM personal_access_tokens 
-- WHERE tokenable_type = 'App\Models\Employe' 
-- AND created_at < NOW() - INTERVAL '30 days';

-- 7. Supprimer tous les tokens d'un employé spécifique (pour forcer reconnexion)
-- ATTENTION: Remplacer 'email@example.com' par l'email réel
-- DELETE FROM personal_access_tokens 
-- WHERE tokenable_type = 'App\Models\Employe' 
-- AND tokenable_id IN (
--     SELECT id_employe FROM employes WHERE email = 'email@example.com'
-- );

-- 8. Vérifier les employés inactifs avec des tokens
SELECT 
    e.id_employe,
    e.email,
    e.nom,
    e.prenom,
    e.actif,
    r.nom_role,
    COUNT(pat.id) as nombre_tokens
FROM employes e
LEFT JOIN personal_access_tokens pat ON pat.tokenable_id = e.id_employe AND pat.tokenable_type = 'App\Models\Employe'
LEFT JOIN roles r ON e.id_role = r.id_role
WHERE e.actif = 'non'
GROUP BY e.id_employe, e.email, e.nom, e.prenom, e.actif, r.nom_role
HAVING COUNT(pat.id) > 0;

-- 9. Activer un employé spécifique
-- ATTENTION: Remplacer 'email@example.com' par l'email réel
-- UPDATE employes 
-- SET actif = 'oui' 
-- WHERE email = 'email@example.com';

-- 10. Vérifier les employés sans rôle
SELECT 
    e.id_employe,
    e.email,
    e.nom,
    e.prenom,
    e.actif,
    e.id_role
FROM employes e
WHERE e.id_role IS NULL OR e.id_role NOT IN (SELECT id_role FROM roles);

-- 11. Statistiques globales
SELECT 
    'Total employés' as categorie,
    COUNT(*) as nombre
FROM employes
UNION ALL
SELECT 
    'Employés actifs',
    COUNT(*) 
FROM employes 
WHERE actif = 'oui'
UNION ALL
SELECT 
    'Employés inactifs',
    COUNT(*) 
FROM employes 
WHERE actif = 'non'
UNION ALL
SELECT 
    'Total tokens employés',
    COUNT(*) 
FROM personal_access_tokens 
WHERE tokenable_type = 'App\Models\Employe'
UNION ALL
SELECT 
    'Tokens utilisés dernières 24h',
    COUNT(*) 
FROM personal_access_tokens 
WHERE tokenable_type = 'App\Models\Employe' 
AND last_used_at > NOW() - INTERVAL '24 hours';

-- 12. Dernières connexions (basé sur création de token)
SELECT 
    e.email,
    e.nom,
    e.prenom,
    r.nom_role,
    pat.created_at as derniere_connexion,
    pat.last_used_at as derniere_utilisation
FROM personal_access_tokens pat
JOIN employes e ON pat.tokenable_id = e.id_employe AND pat.tokenable_type = 'App\Models\Employe'
LEFT JOIN roles r ON e.id_role = r.id_role
ORDER BY pat.created_at DESC
LIMIT 20;
