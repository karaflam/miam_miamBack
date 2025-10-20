<?php

    namespace App\Observers;
    
    use App\Models\Commande;
    use App\Services\FideliteService;
    use App\Services\ParrainageService;
class CommandeObserver {
      
      public function updated(Commande $commande) {
          // Quand une commande passe à "validee"
          if ($commande->statut_commande === 'validee' && 
              $commande->getOriginal('statut_commande') !== 'validee') {
              
              // Attribuer points fidélité
              app(FideliteService::class)->attribuerPoints($commande);
              
              // Vérifier parrainage
              app(ParrainageService::class)->verifierPremiereCommande($commande);
          }
      }
  }
