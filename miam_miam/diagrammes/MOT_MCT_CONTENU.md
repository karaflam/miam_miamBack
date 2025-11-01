# 📋 MOT et MCT - Mon Miam Miam

## MOT (Modèle Organisationnel des Traitements)

### Processus : Passage de Commande

| Acteur | Opération | Quand | Où | Durée |
|--------|-----------|-------|-----|-------|
| Étudiant | Consulte menu | 8h-18h | App mobile | 2-5 min |
| Système | Récupère articles | Immédiat | Backend | <1 sec |
| Étudiant | Sélectionne articles | Après consultation | App | 2-3 min |
| Système | Calcule montant | Temps réel | Frontend | <1 sec |
| Étudiant | Valide commande | Après sélection | App | 10 sec |
| Système | Crée commande BDD | Immédiat | Backend | <1 sec |
| CinetPay | Traite paiement | Immédiat | API externe | 5-30 sec |
| Système | Confirme commande | Après paiement | Backend | <1 sec |
| Système | Notifie staff | Immédiat | Email+Dashboard | <5 sec |
| Employé | Prépare commande | Dès notification | Cuisine | 15-25 min |
| Employé | Marque "prête" | Fin préparation | Dashboard | 10 sec |
| Système | Notifie client | Immédiat | Email+SMS | <5 sec |
| Étudiant | Récupère commande | Heure indiquée | Restaurant | 2 min |
| Employé | Valide livraison | À la remise | Dashboard | 10 sec |
| Système | Attribue points | Immédiat | BDD | <1 sec |

---

## MCT (Modèle Conceptuel des Traitements)

### Processus : Passage de Commande

```
┌─────────────────────────────┐
│ ÉVÉNEMENT DÉCLENCHEUR       │
│ Étudiant sélectionne        │
│ articles                    │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────┐
│ OPÉRATION 1                  │
│ Calculer montant total       │
└──────────────┬───────────────┘
               │
               ▼
        ┌──────────────┐
        │ CONDITION    │
        │ Code promo ? │
        └──┬────────┬──┘
      OUI  │        │ NON
           ▼        │
    ┌────────────┐  │
    │ OPÉRATION 2│  │
    │ Appliquer  │  │
    │ remise     │  │
    └─────┬──────┘  │
          └────┬────┘
               ▼
┌──────────────────────────────┐
│ OPÉRATION 3                  │
│ Créer commande en BDD        │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ OPÉRATION 4                  │
│ Initialiser paiement         │
└──────────────┬───────────────┘
               ▼
        ┌──────────────┐
        │ CONDITION    │
        │ Paiement OK? │
        └──┬────────┬──┘
      OUI  │        │ NON
           ▼        ▼
    ┌────────────┐ ┌────────────┐
    │ OPÉRATION 5│ │ OPÉRATION 6│
    │ Confirmer  │ │ Annuler    │
    │ commande   │ │ commande   │
    └─────┬──────┘ └─────┬──────┘
          │              │
          ▼              ▼
┌─────────────────┐ ┌─────────────────┐
│ ÉVÉNEMENT       │ │ ÉVÉNEMENT       │
│ RÉSULTAT        │ │ RÉSULTAT        │
│ Commande validée│ │ Commande annulée│
└─────────────────┘ └─────────────────┘
```

---

## Instructions Draw.io

**Pour MOT** : Utiliser Cross-Functional Flowchart (swimlanes)
**Pour MCT** : Utiliser formes MERISE (rectangles pour opérations, losanges pour conditions)
