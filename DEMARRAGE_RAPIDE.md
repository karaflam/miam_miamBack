# 🚀 Démarrage Rapide - Menu et Réclamations

## ⚡ En 5 minutes

### 1. Backend - Exécuter les seeders

```bash
cd miam_miam
php artisan db:seed --class=CategorieMenuSeeder
php artisan db:seed --class=MenuSeeder
```

✅ Résultat : 5 plats camerounais créés avec images

### 2. Tester l'API

```bash
# Tester le menu
curl http://localhost:8000/api/menu

# Devrait retourner 5 plats
```

### 3. Intégrer dans le dashboard

**Ouvrir** `EmployeeDashboard.jsx` (ou ManagerDashboard, AdminDashboard)

**Copier-coller** depuis :
- `CODE_MENU_DASHBOARD.jsx` → Section Menu
- `CODE_RECLAMATIONS_DASHBOARD.jsx` → Section Réclamations

**Ou utiliser** l'exemple complet :
- `EXEMPLE_EMPLOYEE_DASHBOARD_COMPLET.jsx`

### 4. Tester

1. Se connecter avec `admin@test.com` / `password`
2. Cliquer sur l'onglet "Menu"
3. Vérifier que les 5 plats s'affichent
4. Cliquer sur l'onglet "Réclamations"
5. Vérifier les statistiques

## 📁 Fichiers importants

### Code React (à copier)
- `CODE_MENU_DASHBOARD.jsx` - Gestion du menu
- `CODE_RECLAMATIONS_DASHBOARD.jsx` - Gestion des réclamations
- `EXEMPLE_EMPLOYEE_DASHBOARD_COMPLET.jsx` - Exemple complet

### Documentation
- `GUIDE_INTEGRATION_DASHBOARDS.md` - Guide détaillé
- `RESUME_INTEGRATION_COMPLETE.md` - Vue d'ensemble complète

### Référence Backend
- `README_MENU.md` - Documentation API menu
- `README_CORRECTIONS_AUTH.md` - Documentation authentification

## 🔌 Endpoints principaux

### Menu
```
GET  /api/menu                              # Liste
POST /api/menu                              # Créer (staff)
PUT  /api/menu/{id}                         # Modifier (staff)
POST /api/menu/{id}/toggle-disponibilite   # Toggle (staff)
```

### Réclamations
```
GET /api/staff/reclamations                 # Liste (staff)
GET /api/staff/reclamations/statistics      # Stats (staff)
PUT /api/staff/reclamations/{id}/status     # Mettre à jour (staff)
```

## 🎯 Checklist

- [ ] Seeders exécutés
- [ ] API testée (curl ou Postman)
- [ ] Code copié dans le dashboard
- [ ] Onglets "Menu" et "Réclamations" ajoutés
- [ ] Tests effectués

## 🐛 Problème ?

1. **Menu vide** → Vérifier que les seeders ont été exécutés
2. **Erreur 401** → Se reconnecter pour obtenir un nouveau token
3. **Erreur 403** → Vérifier le rôle via `/api/diagnostic/auth`

## 📚 Besoin d'aide ?

Consultez `GUIDE_INTEGRATION_DASHBOARDS.md` pour le guide complet.
