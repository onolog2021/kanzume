import React, { useState, useEffect, useContext, useRef } from 'react';
import Board from 'renderer/Classes/Board';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ProjectContext } from 'renderer/components/Context';
import PlaneTextField from 'renderer/GlobalComponent/PlaneTextField';
import { useTheme } from '@mui/material/styles';
import BoardGrid from './BoardGrid';
import ColumnsCountSelector from './ColumnsCountSelecter';
import { ReactComponent as Bookmark } from '../../../../../assets/bookmark.svg';
import { ReactComponent as AddButton } from '../../../../../assets/paper-plus.svg';
import { TabListElement } from '../../../../types/renderElement';
import { FolderElement } from '../../../../types/sqlElement';

export default function BoardSpace({
  boardData,
}: {
  boardData: TabListElement;
}) {
  const [project] = useContext(ProjectContext);
  const [board, setBoard] = useState();
  const [pages, setPages] = useState();
  const [columnsCount, setColumnsCount] = useState<number>(3);
  const [bookmark, setBookmark] = useState<Boolean>(false);
  const [fullWidth, setFullWidth] = useState();
  const titleRef = useRef();
  const theme = useTheme();

  // ボードの取得
  async function fetchBoardData(id: number) {
    const query = {
      table: 'folder',
      conditions: {
        id,
      },
    };
    const data = await window.electron.ipcRenderer.invoke('fetchRecord', query);
    setBoard(data);
  }

  // ボード内のフォルダを取得
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

  // フォルダ内フォルダの階層をすべて取得し、ボードデータの配列を生成
  async function createBoardTree(
    paretntBoardId: number,
    parentArray = []
  ): Promise<FolderElement[]> {
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

  // 集まったボードIDからpage一覧を作成
  async function flattenPages(ids: number[]) {
    const parentboard = new Board({
      id: boardData.id,
    });

    const parentPageData = await parentboard.pages();
    const childPagesData = await window.electron.ipcRenderer.invoke(
      'fetchAllPagesInFolder',
      ids
    );

    const pagesData = [...parentPageData, ...childPagesData];

    console.log(pagesData);
    return pagesData;
  }

  // ボードの初期設定
  async function initialBoard(id: number) {
    // ボードのセットアップ
    await fetchBoardData(id);

    // ボード内のフォルダ階層を配列化
    const boards = await createBoardTree(boardData.id);

    // ボードのIDを並列にする
    const boardIds = boards.map((item) => item.id);
    console.log(boardIds);

    // ボード内とフォルダ内のページを取得
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
    initialBoard(boardData.id);

    window.electron.ipcRenderer.on('updateBoardBody', async () => {
      initialBoard(boardData.id);
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
      const newBoard = new Board({
        id: newData.id,
        title: newData.title,
      });
      setBoard(newBoard);
    });
  }, []);

  useEffect(() => {
    if (titleRef.current) {
      const width = titleRef.current.offsetWidth;
      setFullWidth(width);
    }
  }, [titleRef?.current]);

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
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateBoardList');
  };

  const changeBookmark = async () => {
    if (bookmark) {
      const query = {
        table: 'bookmark',
        conditions: {
          target: 'folder',
          target_id: boardData.id,
        },
      };
      window.electron.ipcRenderer.sendMessage('deleteRecord', query);
      setBookmark(false);
    } else {
      const query = {
        table: 'bookmark',
        columns: {
          target: 'folder',
          target_id: boardData.id,
          position: -1,
          project_id: project.id,
        },
      };
      await window.electron.ipcRenderer.invoke('insertRecord', query);
      setBookmark(true);
    }
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateQuickArea');
  };

  function updateBoardTitle(event) {
    const newTitle = event.target.value; // Get the new title from the input event

    // Update the board's title in the state
    setBoard((prevBoard) => {
      return { ...prevBoard, title: newTitle };
    });
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
