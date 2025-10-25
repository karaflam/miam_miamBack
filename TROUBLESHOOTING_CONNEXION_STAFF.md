# Troubleshooting - Connexion Staff

## Problème: "L'API marche mais aucune page n'est retournée"

### Diagnostic

1. **Vérifier que Vite tourne**
   ```bash
   # Dans un terminal
   cd miam_miam
   npm run dev
   ```
   Vous devriez voir:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ➜  Laravel: http://localhost:8000/
   ```

2. **Vérifier que Laravel sert le frontend**
   - Ouvrez `http://localhost:8000` dans votre navigateur
   - Vous devriez voir votre page d'accueil React

3. **Ouvrir la console du navigateur**
   - Appuyez sur F12
   - Allez dans l'onglet "Console"
   - Essayez de vous connecter
   - Regardez les logs:
     - `Login result: {...}` - Devrait montrer `success: true`
     - `User role: ...` - Devrait montrer `admin`, `manager`, ou `employee`
     - `Navigating to: ...` - Devrait montrer le chemin du dashboard

4. **Vérifier l'onglet Network**
   - F12 → Network
   - Tentez la connexion
   - Cherchez la requête `POST /api/staff/login`
   - Vérifiez la réponse (devrait être 200 OK)

### Solutions possibles

#### Solution 1: Redémarrer Vite
```bash
# Arrêter Vite (Ctrl+C)
# Puis relancer
npm run dev
```

#### Solution 2: Nettoyer le cache
```bash
# Backend
php artisan optimize:clear

# Frontend
rm -rf node_modules/.vite
npm run dev
```

#### Solution 3: Vérifier les routes React
Ouvrez `resources/js/frontend/src/App.jsx` et vérifiez que les routes existent:
```jsx
<Route path="employee" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />
<Route path="manager" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
<Route path="admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
```

#### Solution 4: Vérifier le localStorage
Dans la console du navigateur:
```javascript
// Vérifier le token
localStorage.getItem('auth_token')

// Vérifier l'utilisateur
JSON.parse(localStorage.getItem('currentUser'))
```

Si le token ou l'utilisateur sont null après connexion, il y a un problème avec le service d'authentification.

#### Solution 5: Vérifier AuthContext
Le problème pourrait venir du fait que `AuthContext` ne gère que les utilisateurs (table `users`) et pas les employés (table `employes`).

**Vérification**: Ouvrez `resources/js/frontend/src/context/AuthContext.jsx`

Le contexte devrait charger l'utilisateur depuis `localStorage` au démarrage.

### Logs de debug ajoutés

J'ai ajouté des `console.log` dans `StaffLoginPage.jsx` pour vous aider à diagnostiquer:

1. `Login result:` - Montre la réponse complète de l'API
2. `User role:` - Montre le rôle de l'utilisateur
3. `Navigating to:` - Montre vers quelle page on navigue

### Test manuel

1. Ouvrez `http://localhost:8000/staff-login`
2. Ouvrez la console (F12)
3. Connectez-vous avec `admin@test.com` / `password`
4. Regardez les logs dans la console
5. Partagez-moi ce que vous voyez

### Vérification rapide

Essayez d'accéder directement au dashboard:
- `http://localhost:8000/admin`
- `http://localhost:8000/manager`
- `http://localhost:8000/employee`

Si ces pages fonctionnent, le problème est dans la navigation après connexion.
Si elles ne fonctionnent pas, le problème est dans le routing React ou Vite.

## Checklist de démarrage

- [ ] Laravel tourne (`php artisan serve`)
- [ ] Vite tourne (`npm run dev`)
- [ ] Base de données migrée (`php artisan migrate`)
- [ ] Seeders exécutés (`php artisan db:seed`)
- [ ] Cache nettoyé (`php artisan optimize:clear`)
- [ ] Page d'accueil accessible (`http://localhost:8000`)
- [ ] Console navigateur ouverte (F12)
