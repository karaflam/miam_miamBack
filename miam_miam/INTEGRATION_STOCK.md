# Intégration de la gestion du stock

## ✅ Fonctionnalités implémentées

### 1. Backend

**Contrôleur Stock** (`app/Http/Controllers/Api/StockController.php`)
- ✅ `PUT /api/stock/{id_article}` - Mettre à jour le stock
- ✅ `POST /api/stock/{id_article}/adjust` - Ajuster le stock (ajouter/retirer)
- ✅ `GET /api/stock/ruptures` - Liste des articles en rupture
- ✅ `GET /api/stock/alertes` - Liste des articles en alerte

**MenuController amélioré**
- ✅ Paramètre `show_all=true` pour afficher tous les articles (disponibles et indisponibles)
- ✅ Relation `stock` chargée automatiquement

**MenuResource amélioré**
- ✅ Informations de stock incluses :
  - `quantite_disponible`
  - `seuil_alerte`
  - `en_rupture` (boolean)
  - `alerte_stock` (boolean)

### 2. Frontend

**Dashboards Staff mis à jour**
- ✅ AdminDashboard : Affiche tous les articles avec `show_all=true`
- ✅ EmployeeDashboard : Affiche tous les articles avec `show_all=true`
- ✅ ManagerDashboard : Affiche tous les articles avec `show_all=true`

**Affichage**
- ✅ Articles disponibles et indisponibles visibles
- ✅ Badge "Disponible" / "Indisponible"
- ✅ Informations de stock affichées (si disponibles)

## 📋 Utilisation

### Afficher tous les articles (Staff)

```javascript
// Dans les dashboards staff
fetch('http://localhost:8000/api/menu?show_all=true', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  }
})
```

### Mettre à jour le stock

```javascript
fetch('http://localhost:8000/api/stock/1', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    quantite_disponible: 50,
    seuil_alerte: 10
  })
})
```

### Ajuster le stock

```javascript
// Ajouter 10 unités
fetch('http://localhost:8000/api/stock/1/adjust', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ajustement: 10,
    raison: 'Réapprovisionnement'
  })
})

// Retirer 5 unités
fetch('http://localhost:8000/api/stock/1/adjust', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ajustement: -5,
    raison: 'Vente'
  })
})
```

### Obtenir les ruptures de stock

```javascript
fetch('http://localhost:8000/api/stock/ruptures', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  }
})
```

### Obtenir les alertes de stock

```javascript
fetch('http://localhost:8000/api/stock/alertes', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  }
})
```

## 🎨 Affichage dans les dashboards

Les articles sont maintenant affichés avec :
- Badge de disponibilité (vert = disponible, rouge = indisponible)
- Quantité en stock (si disponible)
- Indicateur d'alerte (si stock faible)
- Indicateur de rupture (si stock = 0)

## 🔄 Prochaines étapes (optionnel)

1. **Interface de gestion du stock**
   - Modal pour ajuster le stock
   - Historique des mouvements de stock
   - Alertes visuelles pour les ruptures

2. **Automatisation**
   - Décrémenter automatiquement le stock lors d'une commande
   - Notifications automatiques pour les alertes de stock

3. **Statistiques**
   - Articles les plus vendus
   - Prévisions de réapprovisionnement
   - Historique des ruptures

## 📊 Structure de la base de données

**Table `stocks`:**
```sql
id_stock (PK)
id_article (FK -> menus.id_article)
quantite_disponible (integer)
seuil_alerte (integer)
date_mise_a_jour (timestamp)
```

**Relation:**
- Menu `hasOne` Stock
- Stock `belongsTo` Menu
