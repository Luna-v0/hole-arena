
import type { Player as PlayerType } from '../types';
import { Card } from './Card';

export const Player = ({ player }: { player: PlayerType }) => {
  return (
    <div>
      <h3>{player.name}</h3>
      <div>
        <h4>Hand:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {player.hand.map((card, index) => (
            <Card key={`${player.player_id}-hand-${card.rank}-${card.suit}-${index}`} card={card} />
          ))}
        </div>
      </div>
      {/* Melds and score will be implemented later */}
    </div>
  );
};
