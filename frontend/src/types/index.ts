
export type Card = {
  rank: string;
  suit: string;
};

export type Meld = {
  id: number;
  cards: Card[];
};

export type Player = {
  name: string;
  hand: Card[];
  melds: Meld[];
  score: number;
};

export type GameState = {
  game_id: string;
  players: Player[];
  deck: { cards: Card[] };
  discard_pile: Card[];
  pots: Card[][];
  current_turn_player_index: number;
  game_started: boolean;
};
