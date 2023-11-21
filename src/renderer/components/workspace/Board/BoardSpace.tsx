import React, { useState, useEffect, useContext, useRef } from 'react';
import Board from 'renderer/Classes/Board';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ProjectContext, ColumnsContext } from 'renderer/components/Context';
import PlaneTextField from 'renderer/GlobalComponent/PlaneTextField';
import { useTheme } from '@mui/material/styles';
import BoardGrid from './BoardGrid';
import ColumnsCountSelector from './ColumnsCountSelecter';
import { ReactComponent as Bookmark } from '../../../../../assets/bookmark.svg';
import { ReactComponent as AddButton } from '../../../../../assets/paper-plus.svg';
import {
  InsertRecordQuery,
  UpdateRecordQuery,
} from '../../../../types/renderElement';
import { FolderElement, PageElement } from '../../../../types/sqlElement';

export default function BoardSpace({
  boardData,
}: {
  boardData: FolderElement;
}) {
  const [project] = useContext(ProjectContext);
  const [board, setBoard] = useState<Board>(boardData);
  const [pages, setPages] = useState<PageElement[]>();
  const [bookmark, setBookmark] = useState<Boolean>(false);
  const titleRef = useRef();
  const theme = useTheme();
  const { columnsState, setColumnsState } = useContext(ColumnsContext);

  // ボードの初期設定
  async function initialBoard() {
    const boardinstance = new Board(boardData);
    setBoard(boardinstance);
    const pagesData = await boardinstance.flattenPages();
    setPages(pagesData);
    const isBookmarked = boardinstance.bookmarked;
    setBookmark(isBookmarked);
  }

  useEffect(() => {
    initialBoard();

    window.electron.ipcRenderer.on('updateBoardBody', async () => {
      const query = {
        table: 'folder',
        conditions: {
          id: boardData.id,
        },
      };
      const newData = await window.electron.ipcRenderer.invoke(
        'fetchRecord',
        query
      );
      const newBoard = new Board(newData);
      setBoard(newBoard);
    });
  }, []);

  useEffect(() => {
    if (titleRef.current) {
      const width = titleRef.current.offsetWidth;
      const newState = { ...columnsState, fullWidth: width };
      setColumnsState(newState);
    }
  }, [titleRef?.current]);

  const addText = async () => {
    const query: InsertRecordQuery<'page'> = {
      table: 'page',
      columns: {
        title: '無題',
        position: -1,
        project_id: project.id,
      },
    };
    const pageId: number = await window.electron.ipcRenderer.invoke(
      'insertRecord',
      query
    );
    const storeQuery: InsertRecordQuery<'store'> = {
      table: 'store',
      columns: {
        page_id: pageId,
        folder_id: boardData.id,
        position: -1,
      },
    };
    await window.electron.ipcRenderer.invoke('insertRecord', storeQuery);
    await initialBoard();
  };

  const changeBoardTitle = () => {
    const title = titleRef.current.value;
    const query: UpdateRecordQuery<'folder'> = {
      table: 'folder',
      columns: {
        title,
      },
      conditions: {
        id: boardData.id,
      },
    };
    window.electron.ipcRenderer.invoke('updateRecord', query);
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateBoardList');
  };

  const changeBookmark = async () => {
    if (bookmark) {
      setBookmark(false);
    } else {
      setBookmark(true);
    }
    board.toggleBookmark();
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateQuickArea');
  };

  function updateBoardTitle(event) {
    const newTitle = event.target.value; // Get the new title from the input event
    setBoard((prevBoard: Board) => {
      return { ...prevBoard, title: newTitle };
    });
  }

  if (board!) {
    <p>loading</p>;
  }

  return (
    <>
      {board && (
        <PlaneTextField
          // defaultValue={board.title}
          value={board.title}
          onChange={(event) => updateBoardTitle(event)}
          onBlur={changeBoardTitle}
          inputRef={titleRef}
        />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ColumnsCountSelector pages={pages} />
        <Tooltip title="テキストの追加" placement="top">
          <IconButton onClick={addText}>
            <AddButton fill="gray" width={30} />
          </IconButton>
        </Tooltip>

        <IconButton onClick={changeBookmark} sx={{ ml: 'auto' }}>
          <Bookmark
            style={{ fill: bookmark ? theme.palette.primary.main : '#999' }}
          />
        </IconButton>
      </Box>

      {pages && <BoardGrid board={board} pages={pages} />}
    </>
  );
}
