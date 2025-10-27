# 📊 Dashboard Manager - Statistiques du Jour et de la Semaine

## ✅ Modifications effectuées

### 1. CA Aujourd'hui - Commandes payées uniquement

**Avant :**
```javascript
const totalRevenue = allOrders.reduce((sum, order) => {
  return sum + (parseFloat(order.montant_total) || 0);
}, 0);
```

**Après :**
```javascript
// Date d'aujourd'hui (début et fin de journée)
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// Filtrer les commandes du jour (statut payé uniquement)
const todayOrders = allOrders.filter(order => {
  const orderDate = new Date(order.created_at);
  return orderDate >= today && orderDate < tomorrow && order.statut_paiement === 'paye';
});

// Calculer le CA du jour
const totalRevenue = todayOrders.reduce((sum, order) => {
  return sum + (parseFloat(order.montant_total) || 0);
}, 0);
```

**Critères :**
- ✅ Commandes créées aujourd'hui uniquement
- ✅ Statut de paiement = `'paye'`
- ✅ Somme des `montant_total`

---

### 2. Nombre de commandes du jour

**Avant :**
```javascript
const totalOrders = allOrders.length; // Toutes les commandes
```

**Après :**
```javascript
const totalOrders = todayOrders.length; // Commandes du jour uniquement
```

**Critère :**
- ✅ Compte uniquement les commandes payées d'aujourd'hui

---

### 3. Graphique CA de la semaine (7 derniers jours)

**Ajout de l'état :**
```javascript
const [weeklyRevenue, setWeeklyRevenue] = useState([])
```

**Calcul des données :**
```javascript
// Calculer les données pour le graphique de la semaine (7 derniers jours)
const weekData = [];
for (let i = 6; i >= 0; i--) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  date.setHours(0, 0, 0, 0);
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  
  const dayOrders = allOrders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= date && orderDate < nextDate && order.statut_paiement === 'paye';
  });
  
  const dayRevenue = dayOrders.reduce((sum, order) => {
    return sum + (parseFloat(order.montant_total) || 0);
  }, 0);
  
  weekData.push({
    date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
    revenue: dayRevenue
  });
}
setWeeklyRevenue(weekData);
```

**Format des données :**
```javascript
[
  { date: "lun. 21", revenue: 45000 },
  { date: "mar. 22", revenue: 52000 },
  { date: "mer. 23", revenue: 38000 },
  { date: "jeu. 24", revenue: 61000 },
  { date: "ven. 25", revenue: 78000 },
  { date: "sam. 26", revenue: 95000 },
  { date: "dim. 27", revenue: 42000 }
]
```

**Graphique mis à jour :**
```javascript
if (salesChartRef.current) {
  chartInstances.current.sales = new Chart(salesChartRef.current, {
    type: 'line',
    data: {
      labels: weeklyRevenue.map(d => d.date),  // ["lun. 21", "mar. 22", ...]
      datasets: [{
        label: 'CA (F)',
        data: weeklyRevenue.map(d => d.revenue),  // [45000, 52000, ...]
        borderColor: '#cfbd97',
        backgroundColor: 'rgba(207, 189, 151, 0.1)',
        tension: 0.4,
        fill: true
      }]
    }
  })
}
```

---

### 4. Graphique des plats les plus vendus

**Ajout de l'état :**
```javascript
const [topSellingData, setTopSellingData] = useState([])
```

**Calcul des données :**
```javascript
// Calculer les plats les plus vendus (tous les temps)
const itemSales = {};
allOrders.forEach(order => {
  if (order.details && Array.isArray(order.details)) {
    order.details.forEach(detail => {
      const itemName = detail.article?.nom || 'Article inconnu';
      const itemId = detail.id_article;
      if (!itemSales[itemId]) {
        itemSales[itemId] = {
          name: itemName,
          quantity: 0
        };
      }
      itemSales[itemId].quantity += parseInt(detail.quantite) || 0;
    });
  }
});

// Trier et prendre les 5 meilleurs
const topItems = Object.values(itemSales)
  .sort((a, b) => b.quantity - a.quantity)
  .slice(0, 5);

setTopSellingData(topItems);
```

**Format des données :**
```javascript
[
  { name: "Eru", quantity: 145 },
  { name: "Ndolé", quantity: 128 },
  { name: "Poulet DG", quantity: 97 },
  { name: "Jus d'Orange", quantity: 86 },
  { name: "Plantain frit", quantity: 72 }
]
```

**Graphique mis à jour :**
```javascript
if (popularItemsChartRef.current && topSellingData.length > 0) {
  chartInstances.current.popularItems = new Chart(popularItemsChartRef.current, {
    type: 'doughnut',
    data: {
      labels: topSellingData.map(item => item.name),  // ["Eru", "Ndolé", ...]
      datasets: [{
        data: topSellingData.map(item => item.quantity),  // [145, 128, ...]
        backgroundColor: ['#cfbd97', '#000000', '#e8dcc0', '#b5a082', '#f5f5f5']
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed + ' vendus'
            }
          }
        }
      }
    }
  })
}
```

---

## 📊 Résumé des données affichées

### Cartes statistiques

| Statistique | Source | Période | Critère |
|-------------|--------|---------|---------|
| **CA Aujourd'hui** | `statistics.totalRevenue` | Aujourd'hui | Commandes payées |
| **Commandes** | `statistics.totalOrders` | Aujourd'hui | Commandes payées |
| **Commandes actives** | `statistics.activeOrders` | Toutes | Statut ≠ livree/annulee |
| **Clients** | `statistics.totalCustomers` | Tous | Role = student |
| **Valeur moyenne** | `statistics.avgOrderValue` | Aujourd'hui | CA / Nb commandes |

### Graphiques

| Graphique | Données | Période | Source |
|-----------|---------|---------|--------|
| **CA de la semaine** | `weeklyRevenue` | 7 derniers jours | Commandes payées par jour |
| **Plats populaires** | `topSellingData` | Tous les temps | Top 5 articles vendus |

---

## 🔄 Flux de données

```
1. Chargement du dashboard
   ↓
2. fetchStatistics() appelé
   ↓
3. Récupération des commandes (GET /api/staff/commandes)
   ↓
4. Filtrage des commandes d'aujourd'hui (statut_paiement = 'paye')
   ↓
5. Calcul du CA du jour
   ↓
6. Calcul du CA des 7 derniers jours (boucle jour par jour)
   ↓
7. Calcul des plats les plus vendus (agrégation par article)
   ↓
8. Mise à jour des états:
   - setStatistics({ totalRevenue, totalOrders, ... })
   - setWeeklyRevenue([...])
   - setTopSellingData([...])
   ↓
9. Re-render du dashboard
   ↓
10. Mise à jour des graphiques (useEffect avec dépendances)
```

---

## 🎯 Champs de la base de données utilisés

### Table `commandes`

| Champ | Utilisation |
|-------|-------------|
| `created_at` | Filtrage par date (aujourd'hui, semaine) |
| `statut_paiement` | Filtrage des commandes payées (`'paye'`) |
| `montant_total` | Calcul du CA |
| `statut` | Filtrage des commandes actives |
| `details` | Relation pour les articles vendus |

### Table `details_commande`

| Champ | Utilisation |
|-------|-------------|
| `id_article` | Identification de l'article |
| `quantite` | Comptage des ventes |
| `article.nom` | Nom de l'article pour le graphique |

### Table `users`

| Champ | Utilisation |
|-------|-------------|
| `role` | Filtrage des clients (`'student'` ou `'etudiant'`) |

---

## ✅ Checklist de vérification

### Statistiques du jour
- [x] CA calculé uniquement sur les commandes d'aujourd'hui
- [x] CA calculé uniquement sur les commandes payées
- [x] Nombre de commandes du jour (payées uniquement)
- [x] Valeur moyenne basée sur les commandes du jour

### Graphique de la semaine
- [x] Affiche les 7 derniers jours
- [x] CA calculé par jour
- [x] Uniquement les commandes payées
- [x] Labels avec jour de la semaine + numéro
- [x] Graphique mis à jour automatiquement

### Graphique des plats
- [x] Top 5 des plats les plus vendus
- [x] Basé sur toutes les commandes (historique complet)
- [x] Agrégation par `id_article`
- [x] Affichage du nom de l'article
- [x] Tooltip avec quantité vendue

---

## 🧪 Tests à effectuer

### Test 1 : CA du jour

**Étapes :**
1. Créer une commande aujourd'hui avec statut `paye`
2. Créer une commande aujourd'hui avec statut `en_attente`
3. Créer une commande hier avec statut `paye`
4. Recharger le dashboard

**Résultat attendu :**
- ✅ Seule la commande 1 est comptée dans le CA
- ✅ La commande 2 (non payée) est exclue
- ✅ La commande 3 (hier) est exclue

### Test 2 : Nombre de commandes du jour

**Étapes :**
1. Vérifier le nombre affiché
2. Compter manuellement les commandes payées d'aujourd'hui en base

**Résultat attendu :**
- ✅ Le nombre correspond exactement

### Test 3 : Graphique de la semaine

**Étapes :**
1. Regarder le graphique
2. Vérifier que les 7 derniers jours sont affichés
3. Vérifier les montants pour un jour spécifique

**Résultat attendu :**
- ✅ 7 points sur le graphique
- ✅ Labels corrects (ex: "lun. 21")
- ✅ Montants cohérents avec la base

### Test 4 : Plats les plus vendus

**Étapes :**
1. Regarder le graphique en donut
2. Vérifier que les 5 plats affichés sont corrects
3. Hover pour voir les quantités

**Résultat attendu :**
- ✅ 5 segments dans le donut
- ✅ Noms des plats corrects
- ✅ Quantités cohérentes
- ✅ Tri décroissant (le plus vendu en premier)

### Test 5 : Rechargement et mise à jour

**Étapes :**
1. Noter les statistiques actuelles
2. Créer une nouvelle commande payée
3. Recharger le dashboard

**Résultat attendu :**
- ✅ CA augmenté du montant de la nouvelle commande
- ✅ Nombre de commandes +1
- ✅ Graphiques mis à jour

---

## 📝 Notes importantes

### Statuts de paiement
Les valeurs possibles pour `statut_paiement` :
- `'paye'` ✅ - Comptabilisé dans le CA
- `'en_attente'` ❌ - Non comptabilisé
- `'echoue'` ❌ - Non comptabilisé
- `'rembourse'` ❌ - Non comptabilisé

### Fuseau horaire
- Les calculs utilisent l'heure locale du navigateur
- `setHours(0, 0, 0, 0)` définit minuit
- Comparaison : `orderDate >= today && orderDate < tomorrow`

### Performance
- Un seul appel API pour récupérer toutes les commandes
- Calculs côté frontend (filtrage, agrégation)
- Optimisation possible : créer une route `/api/staff/dashboard/stats`

---

## 🚀 Améliorations futures possibles

1. **Filtres de période**
   - Ajouter "Aujourd'hui", "Cette semaine", "Ce mois"
   - Permettre de sélectionner une période personnalisée

2. **Comparaison**
   - Comparer avec hier, semaine dernière
   - Afficher le pourcentage d'évolution

3. **Graphiques supplémentaires**
   - Répartition par catégorie de plats
   - Heures de pointe (commandes par heure)
   - Évolution du nombre de clients

4. **Export**
   - Exporter les statistiques en PDF
   - Générer des rapports hebdomadaires/mensuels

5. **Temps réel**
   - WebSocket pour mise à jour en temps réel
   - Notification lors d'une nouvelle commande

---

## ✅ Résumé

**Avant :**
- CA = toutes les commandes (tous les jours)
- Commandes = toutes les commandes
- Graphiques = données mockées statiques

**Après :**
- CA = commandes payées d'aujourd'hui uniquement ✅
- Commandes = commandes payées d'aujourd'hui uniquement ✅
- Graphique semaine = CA des 7 derniers jours (vraies données) ✅
- Graphique plats = Top 5 réels depuis la base de données ✅

**Toutes les statistiques reflètent maintenant les vraies données ! 🎉**
