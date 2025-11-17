import React from 'react';
import { ExpressionItem } from '../types';
import './Canvas.css';

interface CanvasProps {
  items: ExpressionItem[];
  setItems: (items: ExpressionItem[]) => void;
}

const Canvas: React.FC<CanvasProps> = ({ items, setItems }) => {

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <div className="canvas">
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className={`canvas-item item-type-${item.type}`}
        >
          {item.label}
          <button onClick={() => handleRemoveItem(index)} className="remove-item-button">×</button>
        </div>
      ))}
    </div>
  );
};

export default Canvas;
