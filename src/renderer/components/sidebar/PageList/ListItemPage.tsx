import { useContext, useEffect, useState } from 'react';
import { ListItemText, ListItemButton } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Page from 'renderer/Classes/Page';
import ContextMenu from 'renderer/components/ContextMenu';
import { CurrentPageContext, TabListContext } from '../../Context';
import CreateForm from './CreateForm';
import { ReactComponent as PageIcon } from '../../../../../assets/paper.svg';

function ListItemPage({ pageData, index }) {
  const [contextMenuOpen, setContextMenuOpen] = useState(null);
  const [isShowInput, setIsShowInput] = useState(false);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `page-${pageData.id}`,
      data: { area: 'page-list', type: 'page', itemId: pageData.id, index },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    color: currentPage === pageData.id ? 'tomato' : '#333',
  };

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
      <ListItemButton
        onClick={() => handleClick()}
        onContextMenu={showMenu}
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        sx={{
          display: 'grid',
          gridTemplateColumns: '24px 1fr',
          gap: 1,
          height: 40,
          alignItems: 'center',
        }}
      >
        <PageIcon className="sidebarItemIcon" style={{ margin: '0 auto' }} />
        <ListItemText
          primary={pageData.title}
          primaryTypographyProps={{
            sx: {
              fontSize: 14,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
              wordBreak: 'break-all',
            },
          }}
        />
      </ListItemButton>
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
