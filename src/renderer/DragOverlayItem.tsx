import { DragOverlay } from '@dnd-kit/core';

export default function DragOverlayItem({ droppable }) {
  const style = {
    backgroundColor: droppable ? '#f2efe6' : 'gray',
  };

  return (
    <DragOverlay dropAnimation={null} style={{ zIndex: 1200 }}>
      {droppable ? <p style={style}>OK</p> : <p style={style}>NO</p>}
    </DragOverlay>
  );
}
