import { useDrop } from "react-dnd";
import type { Card as CardType } from "../types";
import { ItemTypes } from "../types/dnd";

export const MeldArea = ({ onDrop }: { onDrop: (card: CardType) => void }) => {
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
        border: "2px dashed #ccc",
        padding: "10px",
        minHeight: "100px",
        backgroundColor: isOver ? "lightblue" : "transparent",
      }}
    >
      Drop cards here to create a new meld
    </div>
  );
};
