import { SortableContext, useSortable } from '@dnd-kit/sortable';
import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import Boardpage from './BoardPage';
import PaperBorder from './PaperBorder';
import { FolderElement, PageElement } from '../../../../types/sqlElement';

function BoardGrid({
  board,
  pages,
}: {
  board: FolderElement;
  pages: PageElement[];
}) {
  const [orderArray, setOrderArray] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<number>(0);
  const sizeRef = useRef();

  const { setNodeRef } = useSortable({
    id: 'paper-list',
    data: { area: 'boardBody', parentId: board.id, type: 'area' },
  });

  useEffect(() => {
    const getPages = () => {
      const paperOrderArray: string[] = pages.map((item) => `bp-${item.id}`);
      setOrderArray(paperOrderArray);
    };
    getPages();
  }, [pages]);

  const changeActiveId = (id: number) => {
    setActiveId(id);
  };

  return (
    <Box ref={setNodeRef}>
      <Box
        ref={sizeRef}
        sx={{
          display: 'flex',
          flexShrink: 0,
          flexWrap: 'wrap',
          p: 2,
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
                  orderArray={orderArray}
                  index={index}
                  changeActiveId={changeActiveId}
                />
              ))}
            {pages && (
              <PaperBorder
                boardId={board.id}
                index={pages.length}
                orderArray={orderArray}
                activeId={activeId}
              />
            )}
          </SortableContext>
        )}
      </Box>
    </Box>
  );
}

export default BoardGrid;
