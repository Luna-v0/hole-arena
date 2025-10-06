
import { useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import type { Card as CardType } from '../types';
import { ItemTypes } from '../types/dnd';

declare var cards: any;

const suitMapping: { [key: string]: string } = {
  SPADES: 'S',
  HEARTS: 'H',
  DIAMONDS: 'D',
  CLUBS: 'C',
};

const rankMapping: { [key: string]: string } = {
  ACE: 'A',
  KING: 'K',
  QUEEN: 'Q',
  JACK: 'J',
  TEN: 'T',
  NINE: '9',
  EIGHT: '8',
  SEVEN: '7',
  SIX: '6',
  FIVE: '5',
  FOUR: '4',
  THREE: '3',
  TWO: '2',
};

export const Card = ({ card }: { card: CardType }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { card },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (containerRef.current) {
      const suit = suitMapping[card.suit];
      const rank = rankMapping[card.rank];
      if (suit && rank) {
        const cardObj = cards.create(rank + suit);
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(cardObj);
      }
    }
  }, [card]);

  drag(containerRef);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'inline-block',
        width: '72px',
        height: '96px',
        opacity: isDragging ? 0.5 : 1,
      }}
    ></div>
  );
};

