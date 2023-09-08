import Board from 'renderer/Classes/Board';
import { SortableContext } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Boardpage from './BoardPage';
import { useDroppable } from '@dnd-kit/core';

function BoardGrid({ board,columnsCount, pages }) {
  const [index, setIndex] = useState([]);
  const { setNodeRef } = useDroppable({
    id: 'paper-list',
    data: { area: 'boardBody', parentId: board.id },
  });

  useEffect(() => {
    const getPages = async () => {
      const newAry = await pages.map((item) => `paper-${item.id}`);
      setIndex(newAry);
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
      <SortableContext items={index}>
        {pages &&
          pages.map((page) => (
            <Boardpage
              key={`page-${page.id}`}
              boardId={board.id}
              pageData={page}
              index={index}
            />
          ))}
      </SortableContext>
    </Box>
  );
}

export default BoardGrid;
