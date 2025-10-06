
import { useDrop } from 'react-dnd';
import type { Card as CardType } from '../types';
import { ItemTypes } from '../types/dnd';
import { Card } from './Card';

export const DiscardPile = ({ discardPile, onDrop }: { discardPile: CardType[], onDrop: (card: CardType) => void }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: { card: CardType }) => {
      onDrop(item.card);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} style={{ backgroundColor: isOver ? 'lightcoral' : 'transparent' }}>
      <h4>Discard Pile</h4>
      {discardPile.length > 0 && <Card card={discardPile[discardPile.length - 1]} />}
    </div>
  );
};
