import Board from 'renderer/Classes/Board';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import Boardpage from './BoardPage';

function BoardGrid({ board, columnsCount, pages }) {
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
    const boxWidth = sizeRef.current.getBoundingClientRect().width;
    const paperWidth = (boxWidth - 60 * columnsCount) / columnsCount;
    setItemWidth(paperWidth);
  }, [sizeRef.current, columnsCount]);

  return (
    <Box ref={setNodeRef}>
      <Box
        ref={sizeRef}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
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
                />
              ))}
          </SortableContext>
        )}
      </Box>
    </Box>
  );
}

export default BoardGrid;
