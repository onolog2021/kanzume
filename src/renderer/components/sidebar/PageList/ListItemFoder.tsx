import { useContext, useState, useEffect } from 'react';
import { Collapse } from '@mui/material';
import Folder from 'renderer/Classes/Folder';
import { ProjectContext } from '../../Context';
import TreeBranch from './TreeBranch';
import { ReactComponent as Expand } from '../../../../../assets/expand.svg';
import SidebarItem from '../SidebarItem';
import CreateForm from './CreateForm';

function ListItemFolder({ folderData, orderArray, parentId }) {
  const { children } = folderData;
  const folder = new Folder(folderData);
  const [project, setProject] = useContext(ProjectContext);
  const [open, setOpen] = useState(false);
  const [hasPage, setHasPage] = useState([]);
  const [isShowInput, setIsShowInput] = useState(false);

  const icon = (
    <Expand
      style={
        open ? { transform: 'rotate(0deg)' } : { transform: 'rotate(-90deg)' }
      }
    />
  );

  const dndTag = {
    id: `f-${folderData.id}`,
    data: {
      area: parentId ? 'folder' : 'pageList',
      type: 'folder',
      id: folderData.id,
      parentId,
      orderArray,
    },
  };

  const handleClick = () => {
    setOpen(!open);
  };

  useEffect(() => {
    getPages();
  }, []);

  async function getPages() {
    const pages = await folder.pages();
    setHasPage(pages);
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
        id: folderData.id,
      },
    };
    await window.electron.ipcRenderer.sendMessage('updateRecord', query);
    await window.electron.ipcRenderer.sendMessage('runUpdatePageList');
  };

  const softDelete = async () => {
    const query = {
      table: 'folder',
      conditions: {
        id: folderData.id,
      },
    };
    await window.electron.ipcRenderer.sendMessage('softDelete', query);
    await window.electron.ipcRenderer.sendMessage('runUpdatePageList');
  };

  const mergeChildrenText = () => {
    // childrenのテキストデータ取得
    if (folderData.children) {
      const { children } = folderData;
      const pageIdArray = children.map((childNode) => childNode.id);
      const query = {
        folderName: folderData.title,
        pageIdArray,
        projectId: project.id,
      };
      window.electron.ipcRenderer.sendMessage('mergeTextData', query);
    }
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
    {
      id: 'merge',
      menuName: '結合する',
      method: mergeChildrenText,
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
        initialValue={folderData.title}
      />
    );
  }

  return (
    <>
      <SidebarItem
        icon={icon}
        text={folderData.title}
        functions={functions}
        dndTag={dndTag}
      />
      <Collapse in={open} timeout="auto" unmountOnExit sx={{ pl: 1 }}>
        {children && children.length > 0 && (
          <TreeBranch parentNode={folderData} parentId={folderData.id} />
        )}
      </Collapse>
    </>
  );
}

export default ListItemFolder;
