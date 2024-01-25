import { Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { useTheme } from '@mui/material/styles';
import { DndTagElement } from '../../../../types/renderElement';

export default function PaperBorder({ boardId, index, orderArray }) {
  const theme = useTheme();
  const dndTag: DndTagElement = {
    id: `border-${boardId}-${index}`,
    data: {
      itemType: 'border',
      area: 'boardBody',
      parentId: boardId,
      type: 'paper',
      position: index,
      orderArray,
    },
  };
  const { setNodeRef, over, isOver, active } = useDroppable(dndTag);

  const style = {
    width: 20,
    height: 20,
    background: 'transparent',
  };

  const overedStyle = {
    minHeight: 10,
    minWidth: 2,
    background: isOver ? theme.palette.primary.main : 'transparent',
  };

  if (orderArray && orderArray.length < 1) {
    return (
      <Box
        ref={setNodeRef}
        sx={{
          width: '100%',
          minHeight: '300px',
          background: isOver ? theme.palette.primary.main : 'transparent',
        }}
      />
    );
  }

  return (
    <Box
      ref={setNodeRef}
      sx={
        over && active?.data.current.area !== 'boardBody' ? overedStyle : style
      }
    />
  );
}
