import { useContext, useState } from 'react';
import {
  CurrentPageContext,
  TabListContext,
} from 'renderer/components/Context';
import { ReactComponent as BoardIcon } from '../../../../../assets/board.svg';
import SidebarItem from '../SidebarItem';
import CreateForm from '../PageList/CreateForm';
import { DndTagElement } from '../../../../types/renderElement';

function BoadItem({ board, orderArray, bookmark }) {
  const { setCurrentPage } = useContext(CurrentPageContext);
  const { addTab } = useContext(TabListContext);
  const [isShowInput, setIsShowInput] = useState(false);

  let dndTag: DndTagElement;
  if (bookmark) {
    dndTag = {
      id: `qb-${board.id}`,
      data: {
        area: 'quickAccess',
        type: 'board',
        id: board.id,
        orderArray,
        itemType: 'item',
        bookmark: true,
        content: board.title,
      },
    };
  } else {
    dndTag = {
      id: `b-${board.id}`,
      data: {
        area: 'boardList',
        type: 'board',
        id: board.id,
        orderArray,
        itemType: 'item',
        content: board.title,
      },
    };
  }

  async function handleClick() {
    await setCurrentPage({ id: board.id, type: 'board', parentId: null });
    const value = {
      id: board.id,
      title: board.title,
      type: 'board',
      tabId: `tab-board-${board.id}`,
      parentId: board.id,
    };
    addTab(value);
  }

  const showInput = () => {
    setIsShowInput(true);
  };

  const setStatus = () => {
    setIsShowInput(false);
  };

  const changeName = async (title) => {
    const query = {
      table: 'folder',
      columns: {
        title,
      },
      conditions: {
        id: board.id,
      },
    };
    window.electron.ipcRenderer.invoke('updateRecord', query);
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateBoardList');
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateBoardBody');
  };

  const softDelete = async () => {
    const query = {
      table: 'folder',
      conditions: {
        id: board.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('softDelete', query);
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateBoardList');
  };

  const removeBookmark = () => {
    const query = {
      table: 'bookmark',
      conditions: {
        target: 'folder',
        target_id: board.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('deleteRecord', query);
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateQuickArea');
  };

  const icon = <BoardIcon style={{ fill: 'gray' }} />;

  const menues = [
    {
      id: 'changeName',
      menuName: '名前の変更',
      method: showInput,
    },
    bookmark
      ? {
          id: 'removeBookmark',
          menuName: 'クイックアクセスから外す',
          method: removeBookmark,
        }
      : {
          id: 'delete',
          menuName: '削除',
          method: softDelete,
        },
  ];

  const functions = {
    click: handleClick,
    contextMenu: menues,
  };

  if (isShowInput) {
    return (
      <CreateForm
        setStatus={setStatus}
        createFunc={changeName}
        initialValue={board.title}
      />
    );
  }

  return (
    <SidebarItem
      icon={icon}
      text={board.title}
      functions={functions}
      dndTag={dndTag}
    />
  );
}

export default BoadItem;
