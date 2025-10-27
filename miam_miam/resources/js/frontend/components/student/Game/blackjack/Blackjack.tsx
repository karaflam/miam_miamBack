import React, { useState, useEffect, useCallback } from 'react';
import './BlackjackScoped.css';

interface Card {
  valeur: string;
  couleur: string;
}

interface GameState {
  solde: number;
  mise: number;
  victoiresConsecutives: number;
  nombreTours: number;
  paquet: Card[];
  mainJoueur: Card[];
  mainCroupier: Card[];
  jeuEnCours: boolean;
  message: string;
  messageType: 'victory' | 'defeat' | 'info' | '';
  pointsFidelite: number;
}

const Jeu21: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    solde: 100,
    mise: 0,
    victoiresConsecutives: 0,
    nombreTours: 0,
    paquet: [],
    mainJoueur: [],
    mainCroupier: [],
    jeuEnCours: false,
    message: '',
    messageType: '',
    pointsFidelite: 0
  });

  const initialiserPaquet = useCallback((): Card[] => {
    const valeurs = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const couleurs = ['♠', '♡', '♢', '♣'];
    const paquet: Card[] = [];
    
    for (let valeur of valeurs) {
      for (let couleur of couleurs) {
        paquet.push({ valeur, couleur });
      }
    }
    
    return melangerPaquet(paquet);
  }, []);

  const melangerPaquet = (paquet: Card[]): Card[] => {
    const nouveauPaquet = [...paquet];
    for (let i = nouveauPaquet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nouveauPaquet[i], nouveauPaquet[j]] = [nouveauPaquet[j], nouveauPaquet[i]];
    }
    return nouveauPaquet;
  };

  const valeurCarte = (carte: Card): number => {
    if (['J', 'Q', 'K'].includes(carte.valeur)) return 10;
    if (carte.valeur === 'A') return 11;
    return parseInt(carte.valeur);
  };

  const calculerMain = (main: Card[]): number => {
    let total = 0;
    let asCount = 0;

    for (let carte of main) {
      const valeur = valeurCarte(carte);
      if (valeur === 11) asCount++;
      total += valeur;
    }

    while (total > 21 && asCount > 0) {
      total -= 10;
      asCount--;
    }

    return total;
  };

  const tirerCarte = (paquet: Card[]): { carte: Card; nouveauPaquet: Card[] } => {
    const nouveauPaquet = [...paquet];
    if (nouveauPaquet.length === 0) {
      const paquetComplet = initialiserPaquet();
      return { carte: paquetComplet.pop()!, nouveauPaquet: paquetComplet };
    }
    const carte = nouveauPaquet.pop()!;
    return { carte, nouveauPaquet };
  };

  const placerMise = (montant: number) => {
    // Vérifier si le maximum de tours est atteint
    if (gameState.nombreTours >= 10) {
      setGameState(prev => ({
        ...prev,
        message: 'Maximum de 10 tours atteint ! Partie terminée.',
        messageType: 'info'
      }));
      return false;
    }

    if (montant > 0 && montant <= gameState.solde && !gameState.jeuEnCours) {
      const nouveauPaquet = initialiserPaquet();
      const { carte: carte1, nouveauPaquet: paquet1 } = tirerCarte(nouveauPaquet);
      const { carte: carte2, nouveauPaquet: paquet2 } = tirerCarte(paquet1);
      const { carte: carteCroupier1, nouveauPaquet: paquet3 } = tirerCarte(paquet2);
      const { carte: carteCroupier2, nouveauPaquet: paquetFinal } = tirerCarte(paquet3);

      const mainJoueur = [carte1, carte2];
      const mainCroupier = [carteCroupier1, carteCroupier2];

      setGameState(prev => ({
        ...prev,
        mise: montant,
        jeuEnCours: true,
        nombreTours: prev.nombreTours + 1,
        paquet: paquetFinal,
        mainJoueur,
        mainCroupier,
        message: '',
        messageType: ''
      }));

      // Vérifier blackjack immédiat
      const totalJoueur = calculerMain(mainJoueur);
      if (totalJoueur === 21) {
        setTimeout(() => finPartie(true), 500);
      }
      return true;
    }
    return false;
  };

  const tirerCarteJoueur = () => {
    if (!gameState.jeuEnCours) return;

    const { carte, nouveauPaquet } = tirerCarte(gameState.paquet);
    const mainJoueur = [...gameState.mainJoueur, carte];
    const total = calculerMain(mainJoueur);

    setGameState(prev => ({
      ...prev,
      paquet: nouveauPaquet,
      mainJoueur
    }));

    // Seulement terminer automatiquement si le joueur dépasse 21
    if (total > 21) {
      setTimeout(() => finPartie(false), 500);
    }
  };

  const rester = () => {
    if (!gameState.jeuEnCours) return;
    finPartie(true);
  };

  const doubler = () => {
    if (!gameState.jeuEnCours || gameState.mise * 2 > gameState.solde) return;
    
    const nouvelleMise = gameState.mise * 2;
    const { carte, nouveauPaquet } = tirerCarte(gameState.paquet);
    const mainJoueur = [...gameState.mainJoueur, carte];

    setGameState(prev => ({
      ...prev,
      mise: nouvelleMise,
      paquet: nouveauPaquet,
      mainJoueur
    }));

    const total = calculerMain(mainJoueur);
    if (total <= 21) {
      setTimeout(() => finPartie(true), 500);
    } else {
      setTimeout(() => finPartie(false), 500);
    }
  };

  const finPartie = (joueurTermine: boolean) => {
    if (!gameState.jeuEnCours) return;

    let message = '';
    let victoire = false;
    let nouveauSolde = gameState.solde;
    let nouvellesVictoires = gameState.victoiresConsecutives;
    let pointsFideliteGagnes = 0;

    const totalJoueur = calculerMain(gameState.mainJoueur);
    let mainCroupier = [...gameState.mainCroupier];
    let totalCroupier = calculerMain(mainCroupier);
    let nouveauPaquet = [...gameState.paquet];

    // Vérifier d'abord si le joueur a dépassé
    if (totalJoueur > 21) {
      message = 'Dépassé! Vous avez perdu.';
      victoire = false;
      nouvellesVictoires = 0;
      nouveauSolde -= gameState.mise;
    } else {
      // Tour du croupier seulement si le joueur n'a pas dépassé
      if (joueurTermine) {
        while (totalCroupier < 17) {
          const { carte, nouveauPaquet: updatedPaquet } = tirerCarte(nouveauPaquet);
          mainCroupier.push(carte);
          nouveauPaquet = updatedPaquet;
          totalCroupier = calculerMain(mainCroupier);
        }
      }

      // Déterminer le gagnant
      if (totalCroupier > 21) {
        message = 'Croupier dépassé! Vous gagnez!';
        victoire = true;
      } else if (totalJoueur > totalCroupier) {
        message = 'Vous gagnez!';
        victoire = true;
      } else if (totalJoueur < totalCroupier) {
        message = 'Croupier gagne!';
        victoire = false;
        nouvellesVictoires = 0;
        nouveauSolde -= gameState.mise;
      } else {
        message = 'Égalité! Mise remboursée.';
        victoire = false;
      }
    }

    // Appliquer les gains en cas de victoire
    if (victoire) {
      nouvellesVictoires++;
      
      // Vérifier si c'est un Blackjack naturel (21 avec 2 cartes)
      const estBlackjack = totalJoueur === 21 && gameState.mainJoueur.length === 2;
      
      if (estBlackjack) {
        message = '🃏 BLACKJACK! Vous gagnez 2.5x votre mise!';
        nouveauSolde += Math.floor(gameState.mise * 2.5);
      } else {
        // Victoire normale
        nouveauSolde += gameState.mise;
      }
    }

    // Système de points de fidélité
    // Si atteint 500£ avant 5 tours → 2 points
    if (nouveauSolde >= 500 && gameState.nombreTours <= 5) {
      pointsFideliteGagnes = 2;
      message += ' 🎉 500£ en moins de 5 tours! +2 points de fidélité!';
    }
    // Si atteint au moins 500£ en 10 tours → 1 point
    else if (nouveauSolde >= 500 && gameState.nombreTours <= 10) {
      pointsFideliteGagnes = 1;
      message += ' 👍 500£ atteints! +1 point de fidélité!';
    }

    // Arrêter la partie si 500£ atteints ou 10 tours
    const partieTerminee = nouveauSolde >= 500 || gameState.nombreTours >= 10;

    setGameState(prev => ({
      ...prev,
      solde: nouveauSolde,
      victoiresConsecutives: nouvellesVictoires,
      jeuEnCours: false,
      mainCroupier,
      paquet: nouveauPaquet,
      message: partieTerminee ? message + ' Partie terminée!' : message,
      messageType: victoire ? 'victory' : 'defeat',
      pointsFidelite: prev.pointsFidelite + pointsFideliteGagnes
    }));

    // Synchroniser avec le backend et afficher le message de points
    if (pointsFideliteGagnes > 0) {
      synchroniserPointsFidelite(pointsFideliteGagnes);
    }
    
    // Afficher un message récapitulatif si la partie est terminée
    if (partieTerminee) {
      setTimeout(() => {
        alert(`🎮 Partie terminée!\n\n💰 Solde final: ${nouveauSolde}€\n🎯 Tours joués: ${gameState.nombreTours}\n⭐ Points de fidélité gagnés: ${pointsFideliteGagnes}\n\n${pointsFideliteGagnes > 0 ? '✅ Vos points ont été ajoutés à votre compte!' : '💡 Atteignez 500€ pour gagner des points!'}`);
      }, 1000);
    }
  };

  // Fonction pour synchroniser les points avec le backend
  const synchroniserPointsFidelite = async (points: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token d\'authentification manquant');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/student/points/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          points: points,
          source: 'blackjack'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur lors de la synchronisation des points:', response.status, errorData);
        
        if (response.status === 401) {
          console.error('Session expirée. Veuillez vous reconnecter.');
        }
      } else {
        const data = await response.json();
        console.log('Points synchronisés avec succès:', data);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  const nouvellePartie = () => {
    if (gameState.jeuEnCours) return;
    setGameState(prev => ({
      ...prev,
      mise: 0,
      mainJoueur: [],
      mainCroupier: [],
      message: '',
      messageType: ''
    }));
  };

  const afficherCarte = (carte: Card, index: number, reveler: boolean, estCroupier: boolean = false) => {
    if (estCroupier && index === 1 && !reveler) {
      return (
        <div key={index} className="card card-back">?</div>
      );
    }

    const estRouge = ['♡', '♢'].includes(carte.couleur);
    return (
      <div key={index} className={`card ${estRouge ? 'red' : ''}`}>
        <div className="card-top">{carte.valeur}</div>
        <div className="card-center">{carte.couleur}</div>
        <div className="card-bottom">{carte.valeur}</div>
      </div>
    );
  };

  const [miseInput, setMiseInput] = useState('10');

  const handlePlacerMise = () => {
    const montant = parseInt(miseInput);
    if (!placerMise(montant)) {
      setGameState(prev => ({
        ...prev,
        message: 'Mise invalide!',
        messageType: 'defeat'
      }));
    }
  };

  useEffect(() => {
    setGameState(prev => ({ ...prev, paquet: initialiserPaquet() }));
  }, [initialiserPaquet]);

  return (
    <div className="blackjack-game">
      <div className="container">
        <h1>🎰 Black-Jack 🎰</h1>
      
      <div className="game-info">
        <div className="info-item">
          <div>Solde</div>
          <div className="info-value">{gameState.solde}€</div>
        </div>
        <div className="info-item">
          <div>Mise</div>
          <div className="info-value">{gameState.mise}€</div>
        </div>
        <div className="info-item">
          <div>Tours</div>
          <div className="info-value">{gameState.nombreTours}/10</div>
        </div>
        <div className="info-item">
          <div>Points Fidélité</div>
          <div className="info-value">{gameState.pointsFidelite}</div>
        </div>
      </div>

      {gameState.solde >= 500 && (
        <div className="special-condition" style={{backgroundColor: '#4CAF50', color: 'white'}}>
          🎉 Objectif atteint! Vous avez gagné {gameState.pointsFidelite} point(s) de fidélité!
        </div>
      )}
      
      {gameState.nombreTours >= 5 && gameState.solde < 500 && (
        <div className="special-condition">
          ⚠️ Plus que {10 - gameState.nombreTours} tours pour atteindre 500€ et gagner 1 point!
        </div>
      )}

      <div className="hands-container">
        <div className="hand">
          <div className="hand-title">Votre main</div>
          <div className="cards">
            {gameState.mainJoueur.map((carte, index) => 
              afficherCarte(carte, index, true)
            )}
            {gameState.mainJoueur.length > 0 && (
              <div className="total-display">
                Total: {calculerMain(gameState.mainJoueur)}
              </div>
            )}
          </div>
        </div>
        <div className="hand">
          <div className="hand-title">Main du croupier</div>
          <div className="cards">
            {gameState.mainCroupier.map((carte, index) => 
              afficherCarte(carte, index, !gameState.jeuEnCours, true)
            )}
            {gameState.mainCroupier.length > 0 && (
              <div className="total-display">
                Total: {!gameState.jeuEnCours 
                  ? calculerMain(gameState.mainCroupier) 
                  : `${calculerMain([gameState.mainCroupier[0]])}+?`
                }
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="bet-controls">
          <input
            type="number"
            id="miseInput"
            min="10"
            max="150"
            value={miseInput}
            onChange={(e) => setMiseInput(e.target.value)}
            disabled={gameState.jeuEnCours}
            aria-label="Montant de la mise"
          />
          <button onClick={handlePlacerMise} disabled={gameState.jeuEnCours}>
            Placer la mise
          </button>
        </div>
        
        <div className="game-controls">
          <button 
            className="action-btn" 
            onClick={tirerCarteJoueur} 
            disabled={!gameState.jeuEnCours}
          >
            Tirer
          </button>
          <button 
            className="action-btn" 
            onClick={rester} 
            disabled={!gameState.jeuEnCours}
          >
            Rester
          </button>
          <button 
            onClick={doubler} 
            disabled={!gameState.jeuEnCours || gameState.mise * 2 > gameState.solde}
          >
            Doubler
          </button>
          <button 
            className="action-btn" 
            onClick={nouvellePartie}
          >
            Nouvelle Partie
          </button>
        </div>
      </div>

      {gameState.message && (
        <div className={`message ${gameState.messageType}-message`}>
          {gameState.message}
        </div>
      )}
      </div>
    </div>
  );
};

export default Jeu21;