import { Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';

export default function PaperBorder({ dndData, index }) {
  const droppableData = { ...dndData };
  droppableData.position = index;
  droppableData.itemType = 'border';

  const { setNodeRef, over, isOver } = useDroppable({
    id: `border-${droppableData.area}-${index}`,
    data: droppableData,
  });

  const style = {
    display: 'none',
  };

  const overedStyle = {
    minHeight: 10,
    minWidth: 10,
    background: isOver ? 'blue' : 'gray',
  };

  return <Box ref={setNodeRef} sx={over ? overedStyle : style} />;
}
