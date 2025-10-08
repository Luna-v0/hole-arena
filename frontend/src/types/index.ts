
export type Card = {
  rank: string;
  suit: string;
};

export type Meld = {
  id: string;
  cards: Card[];
};

export type Player = {
  player_id: string;
  name: string;
  is_bot: boolean;
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
