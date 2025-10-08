
import { useDrag } from 'react-dnd';
import type { Card as CardType } from '../types';
import { ItemTypes } from '../types/dnd';

const suitColor: { [key: string]: string } = {
  "Hearts": 'red',
  "Diamonds": 'red',
  "Clubs": 'black',
  "Spades": 'black',
};

const suitSymbol: { [key: string]: string } = {
  "Hearts": '♥',
  "Diamonds": '♦',
  "Clubs": '♣',
  "Spades": '♠',
};

export const Card = ({ card }: { card: CardType }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { card },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  if (card.rank === 'Joker') {
    return (
      <div
        ref={drag}
        style={{
          width: '72px',
          height: '96px',
          border: '1px solid black',
          borderRadius: '5px',
          backgroundColor: 'white',
          padding: '5px',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        Joker
      </div>
    );
  }

  const color = suitColor[card.suit] || 'black';
  const symbol = suitSymbol[card.suit] || '';

  return (
    <div
      ref={drag}
      style={{
        width: '72px',
        height: '96px',
        border: '1px solid black',
        borderRadius: '5px',
        backgroundColor: 'white',
        padding: '5px',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: isDragging ? 0.5 : 1,
        color: color,
        fontFamily: 'sans-serif',
        fontSize: '16px',
        fontWeight: 'bold',
      }}
    >
      <div>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
      <div style={{ alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
    </div>
  );
};

