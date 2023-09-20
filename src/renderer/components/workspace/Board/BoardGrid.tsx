import Board from 'renderer/Classes/Board';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import Boardpage from './BoardPage';

function BoardGrid({ board, columnsCount, pages, fullWidth }) {
  const [orderArray, setOrderArray] = useState([]);
  const [itemWidth, setItemWidth] = useState();
  const sizeRef = useRef();
  const { setNodeRef } = useSortable({
    id: 'paper-list',
    data: { area: 'boardBody', parentId: board.id, type: 'area' },
  });

  useEffect(() => {
    const getPages = () => {
      const paperOrderArray = pages.map((item) => `bp-${item.id}`);
      setOrderArray(paperOrderArray);
    };
    getPages();
  }, []);

  useEffect(() => {
    if (columnsCount) {
      const widthPercent = `${(1 / columnsCount) * 100}%`;
      setItemWidth(widthPercent);
    }
  }, [columnsCount]);

  return (
    <Box ref={setNodeRef}>
      <Box
        ref={sizeRef}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          p: 2,
          minHeight: 800,
        }}
      >
        {orderArray && (
          <SortableContext items={orderArray}>
            {pages &&
              pages.map((page) => (
                <Boardpage
                  key={`page-${page.id}`}
                  boardId={board.id}
                  pageData={page}
                  paperWidth={itemWidth}
                  orderArray={orderArray}
                  fullWidth={fullWidth}
                />
              ))}
          </SortableContext>
        )}
      </Box>
    </Box>
  );
}

export default BoardGrid;
