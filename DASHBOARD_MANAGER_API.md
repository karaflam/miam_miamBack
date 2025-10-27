# 🔌 Dashboard Manager - Connexion API Complète

## ✅ Modifications effectuées

### 1. Suppression des données mockées

**Avant :**
```javascript
import { mockOrders as initialOrders, mockUsers, mockPromotions as initialPromotions } from "../data/mockData"

const [promotions, setPromotions] = useState(initialPromotions)
const totalCustomers = mockUsers.filter((u) => u.role === "student").length
```

**Après :**
```javascript
// Mock data removed - using real API data

const [promotions, setPromotions] = useState([])
const totalCustomers = statistics.totalCustomers
```

---

### 2. Ajout d'un état pour les statistiques

```javascript
const [statistics, setStatistics] = useState({
  totalRevenue: 0,
  totalOrders: 0,
  activeOrders: 0,
  totalCustomers: 0,
  avgOrderValue: 0
})
const [isLoadingStatistics, setIsLoadingStatistics] = useState(false)
```

---

### 3. Fonction `fetchStatistics()` - Récupération des statistiques

```javascript
const fetchStatistics = async () => {
  setIsLoadingStatistics(true);
  try {
    const token = localStorage.getItem('auth_token');
    
    // Récupérer les commandes
    const ordersResponse = await fetch('http://localhost:8000/api/staff/commandes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const ordersData = await ordersResponse.json();
    
    // Récupérer les utilisateurs
    const usersResponse = await fetch('http://localhost:8000/api/staff/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const usersData = await usersResponse.json();
    
    if (ordersData.success && usersData.success) {
      const allOrders = ordersData.data || [];
      const allUsers = usersData.data || [];
      
      // Calculer les statistiques
      const totalRevenue = allOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.montant_total) || 0);
      }, 0);
      
      const totalOrders = allOrders.length;
      const activeOrders = allOrders.filter(o => 
        o.statut !== 'livree' && o.statut !== 'annulee'
      ).length;
      
      const totalCustomers = allUsers.filter(u => 
        u.role === 'student' || u.role === 'etudiant'
      ).length;
      
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      
      setStatistics({
        totalRevenue,
        totalOrders,
        activeOrders,
        totalCustomers,
        avgOrderValue
      });
    }
  } catch (error) {
    console.error('Erreur statistiques:', error);
  } finally {
    setIsLoadingStatistics(false);
  }
};
```

---

### 4. Appel de `fetchStatistics()` dans useEffect

```javascript
useEffect(() => {
  if (activeTab === "dashboard") {
    fetchStatistics();
    fetchOrders(); // Pour les commandes récentes
    fetchMenuItems(); // Pour les articles les plus vendus
    fetchUsers(); // Pour les employés
    fetchComplaints(); // Pour les réclamations urgentes
  }
  // ... autres onglets
}, [activeTab, selectedCategory, searchMenuTerm, roleFilter, searchTerm]);
```

---

### 5. Utilisation des statistiques dans le rendu

**Avant :**
```javascript
const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
const totalOrders = orders.length
const activeOrders = orders.filter(o => o.status !== "completed").length
const totalCustomers = mockUsers.filter((u) => u.role === "student").length
const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
const urgentComplaints = complaints.filter(c => c.status === "urgent").length
```

**Après :**
```javascript
const { totalRevenue, totalOrders, activeOrders, totalCustomers, avgOrderValue } = statistics;
const urgentComplaints = complaints.filter(c => c.statut === 'ouvert').length;
```

---

## 📊 Données affichées dans le dashboard

### Cartes statistiques principales

1. **Chiffre d'affaires du jour**
   - Source : `statistics.totalRevenue`
   - Calcul : Somme de tous les `montant_total` des commandes
   - Format : `{totalRevenue.toLocaleString()} F`

2. **Nombre de commandes**
   - Source : `statistics.totalOrders`
   - Calcul : Nombre total de commandes
   - Format : `{totalOrders}`

3. **Commandes actives**
   - Source : `statistics.activeOrders`
   - Calcul : Commandes dont le statut n'est ni `livree` ni `annulee`
   - Format : `{activeOrders}`

4. **Nombre de clients**
   - Source : `statistics.totalCustomers`
   - Calcul : Utilisateurs avec role `student` ou `etudiant`
   - Format : `{totalCustomers}`

5. **Valeur moyenne des commandes**
   - Source : `statistics.avgOrderValue`
   - Calcul : `totalRevenue / totalOrders`
   - Format : `{avgOrderValue} F`

### Autres sections du dashboard

1. **Commandes récentes**
   - Source : `orders.slice(0, 10)`
   - API : `GET /api/staff/commandes`

2. **Articles les plus vendus**
   - Source : `menuItems` + calcul depuis `orders`
   - API : `GET /api/menu` + `GET /api/staff/commandes`

3. **Équipe (employés)**
   - Source : `employees.slice(0, 3)`
   - API : `GET /api/staff/users` (filtrés par role)

4. **Réclamations urgentes**
   - Source : `complaints.filter(c => c.statut === 'ouvert')`
   - API : `GET /api/staff/reclamations`

---

## 🔄 Flux de données

```
1. Utilisateur ouvre le dashboard
   ↓
2. useEffect détecte activeTab === "dashboard"
   ↓
3. Appels API parallèles :
   - fetchStatistics()
     ├─> GET /api/staff/commandes
     └─> GET /api/staff/users
   - fetchOrders()
   - fetchMenuItems()
   - fetchUsers()
   - fetchComplaints()
   ↓
4. Calcul des statistiques côté frontend
   ↓
5. Mise à jour de l'état statistics
   ↓
6. Re-render avec les vraies données
```

---

## 🎯 Routes API utilisées

| Route | Méthode | Utilisation |
|-------|---------|-------------|
| `/api/staff/commandes` | GET | Récupérer toutes les commandes |
| `/api/staff/users` | GET | Récupérer tous les utilisateurs |
| `/api/menu` | GET | Récupérer les articles du menu |
| `/api/staff/reclamations` | GET | Récupérer les réclamations |

---

## ✅ Checklist de vérification

### Données supprimées
- [x] Import de `mockOrders` supprimé
- [x] Import de `mockUsers` supprimé
- [x] Import de `mockPromotions` supprimé
- [x] Utilisation de `mockUsers` dans calculs supprimée

### Données connectées à l'API
- [x] `totalRevenue` - depuis API
- [x] `totalOrders` - depuis API
- [x] `activeOrders` - depuis API
- [x] `totalCustomers` - depuis API
- [x] `avgOrderValue` - depuis API
- [x] `urgentComplaints` - depuis API (avec statut corrigé)
- [x] `recentOrders` - depuis API
- [x] `topSellingItems` - depuis API
- [x] `employees` - depuis API

### États de chargement
- [x] `isLoadingStatistics` ajouté
- [x] `isLoadingOrders` existant
- [x] `isLoadingMenu` existant
- [x] `isLoadingUsers` existant
- [x] `isLoadingComplaints` existant

---

## 🧪 Tests à effectuer

### Test 1 : Chargement du dashboard

**Étapes :**
1. Se connecter en tant que gérant
2. Aller sur le dashboard principal
3. Attendre le chargement des données

**Résultat attendu :**
- ✅ Toutes les statistiques s'affichent correctement
- ✅ Pas de données "undefined" ou "NaN"
- ✅ Les chiffres correspondent aux vraies données en base
- ✅ Pas d'erreur dans la console

### Test 2 : Vérification des calculs

**Étapes :**
1. Vérifier le CA total dans le dashboard
2. Aller dans "Commandes"
3. Additionner manuellement quelques commandes

**Résultat attendu :**
- ✅ Le CA affiché correspond à la somme des commandes
- ✅ Le nombre de commandes est correct
- ✅ Les commandes actives excluent les livrées et annulées

### Test 3 : Commandes récentes

**Étapes :**
1. Regarder la section "Commandes récentes"
2. Vérifier les 10 dernières commandes

**Résultat attendu :**
- ✅ Les commandes affichées sont les plus récentes
- ✅ Les détails sont corrects (client, montant, statut)
- ✅ Pas de données mockées

### Test 4 : Articles les plus vendus

**Étapes :**
1. Regarder la section "Top Articles"
2. Vérifier que les compteurs sont cohérents

**Résultat attendu :**
- ✅ Les articles affichés sont bien les plus commandés
- ✅ Les quantités sont correctes
- ✅ Le tri est correct (du plus vendu au moins vendu)

### Test 5 : Rechargement

**Étapes :**
1. Recharger la page (F5)
2. Attendre le chargement
3. Vérifier que tout fonctionne

**Résultat attendu :**
- ✅ Les données se rechargent correctement
- ✅ Pas d'erreur
- ✅ Les statistiques sont à jour

---

## 📝 Notes importantes

### Statuts des commandes
Les statuts utilisés dans l'API sont :
- `en_attente` - En attente
- `en_preparation` - En préparation
- `prete` - Prête
- `livree` - Livrée ✅ (exclue des actives)
- `annulee` - Annulée ✅ (exclue des actives)

### Rôles des utilisateurs
Les rôles utilisés dans l'API sont :
- `student` ou `etudiant` - Étudiant (comptés comme clients)
- `employee` - Employé
- `manager` - Gérant
- `admin` - Administrateur

### Format des montants
- Les montants sont en FCFA
- Stockés en base comme `montant_total` (decimal)
- Affichés avec `.toLocaleString()` pour le formatage

---

## 🚀 Prochaines améliorations possibles

1. **Optimisation des appels API**
   - Créer une route `/api/staff/dashboard/statistics` qui retourne toutes les stats en un seul appel
   - Réduire le nombre de requêtes parallèles

2. **Mise en cache**
   - Cacher les statistiques pendant 1-2 minutes
   - Éviter de recharger à chaque changement d'onglet

3. **Graphiques en temps réel**
   - Utiliser les vraies données pour les graphiques Chart.js
   - Afficher l'évolution du CA sur 7 jours

4. **Filtres de période**
   - Ajouter des filtres "Aujourd'hui", "Cette semaine", "Ce mois"
   - Permettre de sélectionner une période personnalisée

---

## ✅ Résumé

**Avant :**
- Dashboard utilisait des données mockées
- Statistiques calculées depuis mockUsers et mockOrders
- Données statiques et non représentatives

**Après :**
- Dashboard 100% connecté à l'API
- Statistiques calculées depuis les vraies données
- Données dynamiques et en temps réel

**Toutes les données du dashboard proviennent maintenant du backend ! 🎉**
