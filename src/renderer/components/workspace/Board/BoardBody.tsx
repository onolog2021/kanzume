import { useState, useEffect } from 'react';
import Board from 'renderer/Classes/Board';
import { Box, Paper } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import Boardpage from './BoardPage';

export default function BoardBody({ boardData }) {
  const [board, setBoard] = useState();
  const [pages, setPages] = useState();
  const [index, setIndex] = useState([]);
  const { setNodeRef } = useDroppable({
    id: 'paper-list',
    data: { parentId: boardData.id },
  });

  useEffect(() => {
    const newBoard = new Board({ id: boardData.id, title: boardData.title });
    setBoard(newBoard);
    const getPages = async () => {
      const result = await newBoard.pages();
      await setPages(result);
      const newAry = await result.map((item) => `paper-${item.id}`);
      setIndex(newAry);
    };
    getPages();
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.on('updatePapers', (args) => {
      if (args[0] === boardData.id) {
        setPages(args[1]);
      }
    });
  }, []);

  return (
    <>
      <h1>{board && board.title}</h1>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          minHeight: '200px',
          '& > :not(style)': {
            m: 1,
            p: 3,
            width: 128,
            height: 128,
          },
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
    </>
  );
}
