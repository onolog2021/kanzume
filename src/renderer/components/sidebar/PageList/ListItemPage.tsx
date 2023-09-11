import { useContext, useEffect, useState } from 'react';
import SidebarItem from '../SidebarItem';
import { CurrentPageContext, TabListContext } from '../../Context';
import CreateForm from './CreateForm';
import { ReactComponent as PageIcon } from '../../../../../assets/paper.svg';

function ListItemPage({ pageData, orderArray, bookmark, parentId }) {
  const [isShowInput, setIsShowInput] = useState(false);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);

  const icon = <PageIcon />;

  let dndTag;
  if (bookmark) {
    dndTag = {
      id: `qp-${pageData.id}`,
      data: {
        area: 'quickAccess',
        type: 'page',
        id: pageData.id,
        orderArray,
      },
    };
  } else {
    dndTag = {
      id: `p-${pageData.id}`,
      data: {
        area: parentId ? 'folder' : 'pageList',
        type: 'page',
        id: pageData.id,
        parentId,
        orderArray,
      },
    };
  }

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

  const softDelete = async () => {
    const query = {
      table: 'page',
      conditions: {
        id: pageData.id,
      },
    };
    await window.electron.ipcRenderer.sendMessage('softDelete', query);
    await window.electron.ipcRenderer.sendMessage('runUpdatePageList');
  };

  const showInput = () => {
    setIsShowInput(true);
  };

  const setStatus = () => {
    setIsShowInput(false);
  };

  const changeName = async (title) => {
    const query = {
      table: 'page',
      columns: {
        title,
      },
      conditions: {
        id: pageData.id,
      },
    };
    await window.electron.ipcRenderer.sendMessage('updateRecord', query);
    await window.electron.ipcRenderer.sendMessage('runUpdatePageList');
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
    contextMenu: menues,
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
    <SidebarItem
      icon={icon}
      text={pageData.title}
      functions={functions}
      dndTag={dndTag}
    />
  );
}

export default ListItemPage;
