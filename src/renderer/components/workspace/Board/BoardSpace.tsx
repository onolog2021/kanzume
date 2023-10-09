import { useState, useEffect, useContext, useRef } from 'react';
import Board from 'renderer/Classes/Board';
import { Box, Paper, Button, IconButton, Tooltip } from '@mui/material';
import { ProjectContext } from 'renderer/components/Context';
import Page from 'renderer/Classes/Page';
import PlaneTextField from 'renderer/GlobalComponent/PlaneTextField';
import { electron } from 'process';
import theme from 'renderer/theme';
import BoardGrid from './BoardGrid';
import ColumnsCountSelector from './ColumnsCountSelecter';
import { ReactComponent as Bookmark } from '../../../../../assets/bookmark.svg';
import { ReactComponent as AddButton } from '../../../../../assets/paper-plus.svg';

export default function BoardSpace({ boardData }) {
  const [project] = useContext(ProjectContext);
  const [board, setBoard] = useState();
  const [pages, setPages] = useState();
  const [columnsCount, setColumnsCount] = useState<number>(3);
  const [bookmark, setBookmark] = useState<Boolean>(false);
  const [fullWidth, setFullWidth] = useState();
  const titleRef = useRef();

  async function initialBoard() {
    const boards = await createBoardTree(boardData.id);
    const boardIds = boards.map((board) => board.id);
    const pagesData = await flattenPages(boardIds);
    setPages(pagesData);

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
    if (isBookmarked) {
      setBookmark(true);
    }
  }

  useEffect(() => {
    const newBoard = new Board({
      id: boardData.id,
      title: boardData.title,
    });
    setBoard(newBoard);

    initialBoard();

    window.electron.ipcRenderer.on('updateBoardBody', () => {
      initialBoard();
    });
  }, []);

  useEffect(() => {
    if (titleRef.current) {
      const width = titleRef.current.offsetWidth;
      setFullWidth(width);
    }
  }, [titleRef?.current]);

  // 集まったIDからpage一覧を作成
  async function flattenPages(ids: number[]) {
    const parentboard = new Board({
      id: boardData.id,
    });
    const pagesData = await parentboard.pages();
    for (const id of ids) {
      const board = new Board({ id });
      const pages = await board.pages();
      pagesData.push(...pages);
    }
    return pagesData;
  }

  async function createBoardTree(
    paretntBoardId: number,
    parentArray = []
  ): Promise<any[]> {
    // ボードのページチルドレンを取得
    const children = await childrenBoards(paretntBoardId);
    parentArray.push(...children);

    // もしボードにストアがあり、それがparent_idを持つものであれば、そのフォルダがのparent_idを取得
    if (children && children.length > 0) {
      for (const child of children) {
        await createBoardTree(child.id, parentArray);
      }
    }
    return parentArray;
  }

  async function childrenBoards(boardId: number) {
    const query = {
      table: 'folder',
      conditions: {
        parent_id: boardId,
      },
    };
    const boardsChildren = await window.electron.ipcRenderer.invoke(
      'fetchRecords',
      query
    );
    return boardsChildren;
  }

  const addText = async () => {
    const query = {
      table: 'page',
      columns: {
        title: '無題',
        position: -1,
        project_id: project.id,
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
    await initialBoard();
  };

  const changeColumnsCount = (count: number) => {
    setColumnsCount(count);
  };

  const changeBoardTitle = () => {
    const title = titleRef.current.value;
    const query = {
      table: 'folder',
      columns: {
        title,
      },
      conditions: {
        id: boardData.id,
      },
    };
    window.electron.ipcRenderer.invoke('updateRecord', query);
  };

  const changeBookmark = async () => {
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
          project_id: project.id,
        },
      };
      await window.electron.ipcRenderer.invoke('insertRecord', query);
      setBookmark(true);
    }
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateQuickArea');
  };

  return (
    <>
      {board && (
        <PlaneTextField
          defaultValue={board.title}
          onBlur={changeBoardTitle}
          inputRef={titleRef}
        />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ColumnsCountSelector
          changeColumnsCount={changeColumnsCount}
          pages={pages}
          fullwidth={fullWidth}
        />
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

      {pages && (
        <BoardGrid
          board={board}
          columnsCount={columnsCount}
          pages={pages}
          fullWidth={fullWidth}
        />
      )}
    </>
  );
}
