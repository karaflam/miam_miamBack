// src/types/blackjack.ts
export interface Card {
  valeur: string;
  couleur: string;
}

export interface GameState {
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

export type Suit = '♠' | '♡' | '♢' | '♣';
export type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';