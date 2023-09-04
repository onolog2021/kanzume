import { useState, useEffect, useContext } from 'react';
import Board from 'renderer/Classes/Board';
import { Box, Paper, Button } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { ProjectContext } from 'renderer/components/Context';
import BoardGrid from './BoardGrid';
import ColumnsCountSelector from './ColumnsCountSelecter';

export default function BoardSpace({ boardData }) {
  const [project] = useContext(ProjectContext);
  const [board, setBoard] = useState();
  const [pages, setPages] = useState();
  const [columnsCount, setColumnsCount] = useState<number>(3);

  useEffect(() => {
    const newBoard = new Board({ id: boardData.id, title: boardData.title });
    setBoard(newBoard);

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

  const changeColumnsCount = (count: number) => {
    setColumnsCount(count);
  };

  return (
    <>
      <h1>{board && board.title}</h1>
      <ColumnsCountSelector changeColumnsCount={changeColumnsCount} />
      <Button onClick={addText}>テキストの追加</Button>
      {board && <BoardGrid board={board} columnsCount={columnsCount} />}
    </>
  );
}
