import { Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';

export default function PaperBorder({ boardId, index, orderArray }) {
  const { setNodeRef, over, isOver, active } = useDroppable({
    id: `border-${boardId}-${index}`,
    data: {
      itemType: 'border',
      area: 'boardBody',
      parentId: boardId,
      type: 'paper',
      position: index,
      orderArray,
    },
  });

  const style = {
    display: 'none',
    width: 20,
    height: 20,
    background: 'tomato',
  };

  const overedStyle = {
    display: 'block',
    minHeight: 10,
    minWidth: 10,
    background: isOver ? 'blue' : 'gray',
  };

  return (
    <Box
      ref={setNodeRef}
      sx={
        over && active?.data.current.area !== 'boardBody' ? overedStyle : style
      }
    />
  );
}
