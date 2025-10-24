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
  paquet: Card[];
  mainJoueur: Card[];
  mainCroupier: Card[];
  jeuEnCours: boolean;
  message: string;
  messageType: 'victory' | 'defeat' | 'info' | '';
}

const Jeu21: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    solde: 100,
    mise: 0,
    victoiresConsecutives: 0,
    paquet: [],
    mainJoueur: [],
    mainCroupier: [],
    jeuEnCours: false,
    message: '',
    messageType: ''
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
        // En cas d'égalité, on ne change pas le solde ni les victoires
      }
    }

    // Appliquer les gains en cas de victoire
    if (victoire) {
      nouvellesVictoires++;
      
      // Vérifier si c'est un Blackjack naturel (21 avec 2 cartes)
      const estBlackjack = totalJoueur === 21 && gameState.mainJoueur.length === 2;
      
      if (nouvellesVictoires >= 3) {
        // Condition spéciale: doit avoir un As pour gagner
        const aUn = gameState.mainJoueur.some(carte => carte.valeur === 'A');
        if (!aUn) {
          message = '3 victoires! Mais vous devez avoir un As pour gagner!';
          victoire = false;
          nouvellesVictoires = 0;
          nouveauSolde -= gameState.mise;
        } else {
          message = '🎉 3 victoires avec un As! Vous gagnez TRIPLE!';
          nouveauSolde += gameState.mise * 3; // Triple gain
          nouvellesVictoires = 0; // Réinitialiser après le bonus
        }
      } else if (estBlackjack) {
        message = '🃏 BLACKJACK! Vous gagnez 2.5x votre mise!';
        nouveauSolde += Math.floor(gameState.mise * 2.5);
      } else {
        // Victoire normale
        nouveauSolde += gameState.mise;
      }
    }

    setGameState(prev => ({
      ...prev,
      solde: nouveauSolde,
      victoiresConsecutives: nouvellesVictoires,
      jeuEnCours: false,
      mainCroupier,
      paquet: nouveauPaquet,
      message,
      messageType: victoire ? 'victory' : 'defeat'
    }));
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
          <div>Victoires</div>
          <div className="info-value">{gameState.victoiresConsecutives}</div>
        </div>
      </div>

      {gameState.victoiresConsecutives >= 2 && (
        <div className="special-condition">
          ⚠️ Condition spéciale: 3 victoires - vous devez avoir un As (A) pour gagner TRIPLE !
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