import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { ExpressionItem } from '../types';
import './Canvas.css';

interface CanvasProps {
  items: ExpressionItem[];
  setItems: (items: ExpressionItem[]) => void;
}

const Canvas: React.FC<CanvasProps> = ({ items, setItems }) => {
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);
    setItems(reorderedItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="canvas" direction="horizontal">
        {(provided) => (
          <div className="canvas" {...provided.droppableProps} ref={provided.innerRef}>
            {items.map((item, index) => (
              <Draggable key={`${item.id}-${index}`} draggableId={`${item.id}-${index}`} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`canvas-item item-type-${item.type}`}
                  >
                    {item.label}
                    <button onClick={() => handleRemoveItem(index)} className="remove-item-button">×</button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Canvas;
