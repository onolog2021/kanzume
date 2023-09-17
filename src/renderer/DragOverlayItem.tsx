import { DragOverlay } from '@dnd-kit/core';
import { Box } from '@mui/material';
import { ReactComponent as ForbiddenMark } from '../../assets/forbidden.svg';

export default function DragOverlayItem({ droppable, content }) {
  const style = {
    backgroundColor: droppable ? '#f2efe6' : 'gray',
  };

  const forbidden = (
    <ForbiddenMark style={{ position: 'absolute', top: -10, fill: 'tomato' }} />
  );

  return (
    <DragOverlay dropAnimation={null} style={{ zIndex: 1200 }}>
      {droppable ? null : forbidden}
      <Box
        sx={{
          textAlign: 'center',
          width: 120,
          backgroundColor: 'rgba(233, 233, 233, 0.46)',
          whiteSpace: 'nowrap',
          px: 2,
        }}
      >
        {content && content}
      </Box>
    </DragOverlay>
  );
}
