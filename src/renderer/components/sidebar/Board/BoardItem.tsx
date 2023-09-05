import { useContext, useState } from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CurrentPageContext } from 'renderer/components/Context';
// import Folder from 'renderer/Classes/Folder';
import { TabListContext } from 'renderer/components/Context';
import { ReactComponent as BoardLogo } from '../../../../../assets/square.svg';
import SidebarItem from '../SidebarItem';
import CreateForm from '../PageList/CreateForm';

function BoadItem({ board, index }) {
  // const thisFolder = new Folder(folder);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [isShowInput, setIsShowInput] = useState(false);
  // const { attributes, listeners, setNodeRef, transform, transition } =
  //   useSortable({
  //     id: `board-${board.id}`,
  //     data: { type: 'board', area: 'board-list', itemId: board.id, index },
  //   });

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };

  async function handleClick() {
    await setCurrentPage({ id: board.id, type: 'board' });
    const value = {
      id: board.id,
      title: board.title,
      type: 'board',
      tabId: `tab-board-${board.id}`,
      parentId: board.id,
    };
    if (
      tabList.length === 0 ||
      !tabList.some((item) => item.tabId === value.tabId)
    ) {
      await setTabList((prevTabs) => [...prevTabs, value]);
    }
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
    await window.electron.ipcRenderer.sendMessage('updateRecord', query);
    await window.electron.ipcRenderer.sendMessage('runUpdateBoardList');
  };

  const softDelete = async () => {
    const query = {
      table: 'folder',
      conditions: {
        id: board.id,
      },
    };
    await window.electron.ipcRenderer.sendMessage('softDelete', query);
    await window.electron.ipcRenderer.sendMessage('runUpdateBoardList');
  };

  const icon = <BoardLogo />;

  const menues = [
    {
      id: 'changeName',
      menuName: '名前の変更',
      method: showInput,
    },
    {
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

  return <SidebarItem icon={icon} text={board.title} functions={functions} />;
}

export default BoadItem;
