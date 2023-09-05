import { useContext, useEffect, useState } from 'react';
import { ListItemText, ListItemButton } from '@mui/material';
import { CSS } from '@dnd-kit/utilities';
import Page from 'renderer/Classes/Page';
import ContextMenu from 'renderer/components/ContextMenu';
import SidebarItem from '../SidebarItem';
import { CurrentPageContext, TabListContext } from '../../Context';
import CreateForm from './CreateForm';
import { ReactComponent as PageIcon } from '../../../../../assets/paper.svg';

function ListItemPage({ pageData, index }) {
  const [contextMenuOpen, setContextMenuOpen] = useState(null);
  const [isShowInput, setIsShowInput] = useState(false);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);

  const icon = <PageIcon />;

  const handleClick = () => {
    const value = {
      id: pageData.id,
      title: pageData.title,
      type: 'editor',
      tabId: `tab-editor-${pageData.id}`,
    };
    if (
      !tabList.some((item) => item.id === value.id && item.type === 'editor')
    ) {
      setTabList((prevTabs) => [...prevTabs, value]);
    }
    setCurrentPage({ id: pageData.id, type: 'editor' });
  };

  const showMenu = (event) => {
    event.preventDefault();
    setContextMenuOpen(
      contextMenuOpen === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };

  const closeContextMenu = () => {
    setContextMenuOpen(false);
  };

  const softDelete = () => {
    const query = {
      table: 'page',
      conditions: {
        id: pageData.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('softDelete', query);
  };

  const showInput = () => {
    setIsShowInput(true);
  };

  const setStatus = () => {
    setIsShowInput(false);
  };

  const changeName = (title) => {
    const query = {
      table: 'page',
      columns: {
        title,
      },
      conditions: {
        id: pageData.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  };

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
  };

  if (isShowInput) {
    return (
      <CreateForm
        setStatus={setStatus}
        createFunc={changeName}
        initialValue={pageData.title}
      />
    );
  }

  return (
    <>
      <SidebarItem icon={icon} text={pageData.title} functions={functions} />
      {contextMenuOpen && (
        <ContextMenu
          contextMenu={contextMenuOpen}
          onClose={closeContextMenu}
          menues={menues}
        />
      )}
    </>
  );
}

export default ListItemPage;
