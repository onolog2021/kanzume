import Board from 'renderer/Classes/Board';
import { SortableContext } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import Boardpage from './BoardPage';

function BoardGrid({ board, columnsCount, pages }) {
  const [orderArray, setOrderArray] = useState([]);
  const { setNodeRef } = useDroppable({
    id: 'paper-list',
    data: { area: 'boardBody', parentId: board.id },
  });

  useEffect(() => {
    const getPages = () => {
      const paperOrderArray = pages.map((item) => `bp-${item.id}`);
      setOrderArray(paperOrderArray);
    };
    getPages();
  }, []);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
        gap: 2,
      }}
      ref={setNodeRef}
    >
      {orderArray && (
        <SortableContext items={orderArray}>
          {pages &&
            pages.map((page) => (
              <Boardpage
                key={`page-${page.id}`}
                boardId={board.id}
                pageData={page}
                orderArray={orderArray}
              />
            ))}
        </SortableContext>
      )}
    </Box>
  );
}

export default BoardGrid;
