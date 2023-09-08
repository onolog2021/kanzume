import { useContext, useState } from 'react';
import { List, Box, IconButton } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import Folder from 'renderer/Classes/Folder';
import { SortableContext } from '@dnd-kit/sortable';
import {
  ProjectContext,
  CurrentPageContext,
  TabListContext,
} from '../../Context';
import TreeBranch from './TreeBranch';
import CreateForm from './CreateForm';
import { ReactComponent as PageIcon } from '../../../../../assets/paper.svg';
import CategoryTitle from '../CategoryTitle';
import { ReactComponent as AddPageButton } from '../../../../../assets/paper-plus.svg';
import { ReactComponent as AddFolderButton } from '../../../../../assets/folder-plus.svg';

function PageList({ root }) {
  const [project] = useContext(ProjectContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [newForm, setNewForm] = useState(null);
  const svg = <PageIcon />;

  const { setNodeRef } = useDroppable({
    id: 'page-list',
    data: { area: 'pageList' },
  });

  const switchNewForm = (status: string) => {
    setNewForm(status);
  };

  const createNewPage = async (title: string) => {
    const pageArgs = {
      table: 'page',
      columns: {
        title,
        project_id: project.id,
        content: '{}',
        position: -1,
      },
    };
    const newId = await window.electron.ipcRenderer.invoke(
      'insertRecord',
      pageArgs
    );
    await window.electron.ipcRenderer.sendMessage('updatePageList', project.id);
    const newTab = {
      id: newId,
      title,
      type: 'editor',
      tabId: `tab-editor-${newId}`,
    };
    setTabList((prevList) => {
      prevList.push(newTab);
      return prevList;
    });
    setCurrentPage({ id: newId, type: 'editor' });
  };

  const createNewFolder = async (title: string) => {
    const newFolder = new Folder({
      title,
      project_id: project.id,
    });
    await newFolder.create();
    await window.electron.ipcRenderer.sendMessage('updatePageList', project.id);
  };

  if (!root) {
    return <h1>Now Loading...</h1>;
  }

  return (
    <>
      <div className="sideBarSectionName">
        <CategoryTitle svg={svg} categoryName="テキスト" />
        <IconButton onClick={() => switchNewForm('page')}>
          <AddPageButton />
        </IconButton>
        <IconButton onClick={() => switchNewForm('folder')}>
          <AddFolderButton />
        </IconButton>
      </div>

      {newForm === 'page' && (
        <CreateForm
          createFunc={createNewPage}
          setStatus={switchNewForm}
          label="ページタイトル"
        />
      )}
      {newForm === 'folder' && (
        <CreateForm
          createFunc={createNewFolder}
          setStatus={switchNewForm}
          label="フォルダタイトル"
        />
      )}
      <List ref={setNodeRef}>{root && <TreeBranch parentNode={root} />}</List>
    </>
  );
}

export default PageList;
