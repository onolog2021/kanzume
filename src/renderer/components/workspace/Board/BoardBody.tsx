import { useState, useEffect, useContext } from 'react';
import Board from 'renderer/Classes/Board';
import { Box, Paper, Button } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { ProjectContext } from 'renderer/components/Context';
import Boardpage from './BoardPage';

export default function BoardBody({ boardData }) {
  const [project] = useContext(ProjectContext);
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

  const addText = async () => {
    const query = {
      table: 'page',
      columns: {
        title: '無題',
        position: -1,
        project_id: project.id,
        content: '{}',
      },
    };
    const page_id = await window.electron.ipcRenderer.invoke(
      'insertRecord',
      query
    );
    const storeQuery = {
      table: 'store',
      columns: {
        page_id,
        folder_id: boardData.id,
        position: -1,
      },
    };
    window.electron.ipcRenderer.invoke('insertRecord', storeQuery);
  };

  return (
    <>
      <h1>{board && board.title}</h1>
      <Button onClick={addText}>テキストの追加</Button>
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
