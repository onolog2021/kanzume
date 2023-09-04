import { useState, useEffect, useContext } from 'react';
import Board from 'renderer/Classes/Board';
import { Box, Paper, Button, IconButton } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { ProjectContext } from 'renderer/components/Context';
import Page from 'renderer/Classes/Page';
import BoardGrid from './BoardGrid';
import ColumnsCountSelector from './ColumnsCountSelecter';
import PageTitleForm from '../PageTitleForm';
import { ReactComponent as Bookmark } from '../../../../../assets/bookmark.svg';

export default function BoardSpace({ boardData }) {
  const [project] = useContext(ProjectContext);
  const [board, setBoard] = useState();
  const [pages, setPages] = useState();
  const [columnsCount, setColumnsCount] = useState<number>(3);
  const [bookmark, setBookmark] = useState<Boolean>(false);

  useEffect(() => {
    async function initialBoard() {
      const newBoard = await new Board({
        id: boardData.id,
        title: boardData.title,
      });
      setBoard(newBoard);
      const defaultPages = await newBoard.pages();
      setPages(defaultPages);

      const bookmarkQuery = {
        table: 'bookmark',
        conditions: {
          target: 'folder',
          target_id: boardData.id,
        },
      };
      const isBookmarked = await window.electron.ipcRenderer.invoke(
        'fetchRecord',
        bookmarkQuery
      );
      console.log(isBookmarked);
      if (isBookmarked) {
        setBookmark(true);
      }
    }

    initialBoard();

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
      table: 'bookmark',
      columns: {
        page_id,
        folder_id: boardData.id,
        position: -1,
      },
    };
    window.electron.ipcRenderer.invoke('insertRecord', storeQuery);
    const newPages = await board.pages();
    setPages(newPages);
  };

  const changeColumnsCount = (count: number) => {
    setColumnsCount(count);
  };

  const changeBoardTitle = (title: string) => {
    const query = {
      table: 'folder',
      columns: {
        title,
      },
      conditions: {
        id: boardData.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  };

  const changeBookmark = () => {
    console.log('fire');

    if (bookmark) {
      const query = {
        table: 'bookmark',
        conditions: {
          target: 'folder',
          target_id: board.id,
        },
      };
      window.electron.ipcRenderer.sendMessage('deleteRecord', query);
      setBookmark(false);
    } else {
      const query = {
        table: 'bookmark',
        columns: {
          target: 'folder',
          target_id: board.id,
          position: -1,
          project_id: project.id
        },
      };
      window.electron.ipcRenderer.invoke('insertRecord', query);
      setBookmark(true);
    }
  };

  return (
    <>
      {board && (
        <PageTitleForm defaultValue={board.title} onBlur={changeBoardTitle} />
      )}
      <ColumnsCountSelector changeColumnsCount={changeColumnsCount} />
      <Button onClick={addText}>テキストの追加</Button>
      <IconButton onClick={changeBookmark}>
        <Bookmark style={{ fill: bookmark ? 'blue' : 'red' }} />
      </IconButton>
      {pages && (
        <BoardGrid board={board} columnsCount={columnsCount} pages={pages} />
      )}
    </>
  );
}
