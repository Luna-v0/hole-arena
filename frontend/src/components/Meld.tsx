
import { useDrop } from 'react-dnd';
import type { Meld as MeldType, Card as CardType } from '../types';
import { ItemTypes } from '../types/dnd';
import { Card } from './Card';

export const Meld = ({ meld, onDrop }: { meld: MeldType, onDrop: (card: CardType) => void }) => {
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
    <div
      ref={drop}
      style={{
        display: 'flex',
        border: '1px solid green',
        padding: '5px',
        margin: '5px',
        backgroundColor: isOver ? 'lightgreen' : 'transparent',
      }}
    >
      {meld.cards.map((card, index) => (
        <Card key={index} card={card} />
      ))}
    </div>
  );
};
