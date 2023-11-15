import Board, { BoardElement } from 'renderer/Classes/Board';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import Boardpage from './BoardPage';
import PaperBorder from './PaperBorder';

function BoardGrid({ board, columnsCount, pages, fullWidth }): {
  board: Board;
  columnCount: number;
  pages: [];
  fullWidth: number;
} {
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
  }, [pages]);

  useEffect(() => {
    if (columnsCount) {
      const width = (fullWidth - 16 * (columnsCount + 1)) / columnsCount;
      const percent = `${(width / fullWidth) * 100}%`;
      setItemWidth(percent);
    }
  }, [columnsCount]);

  return (
    <Box ref={setNodeRef}>
      <Box
        ref={sizeRef}
        sx={{
          display: 'flex',
          flexShrink: 0,
          flexWrap: 'wrap',
          p: 2,
          minHeight: 800,
        }}
      >
        {orderArray && (
          <SortableContext items={orderArray}>
            {pages &&
              pages.map((page, index) => (
                <Boardpage
                  key={`page-${page.id}`}
                  boardId={board.id}
                  pageData={page}
                  paperWidth={itemWidth}
                  orderArray={orderArray}
                  fullWidth={fullWidth}
                  index={index}
                />
              ))}
            {pages && (
              <PaperBorder
                boardId={board.id}
                index={pages.length}
                orderArray={orderArray}
              />
            )}
          </SortableContext>
        )}
      </Box>
    </Box>
  );
}

export default BoardGrid;
