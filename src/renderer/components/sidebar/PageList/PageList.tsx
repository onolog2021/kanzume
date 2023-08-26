import { useContext, useState } from 'react';
import { List, Button } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import Folder from 'renderer/Classes/Folder';
import {
  ProjectContext,
  CurrentPageContext,
  TabListContext,
} from '../../Context';
import TreeBranch from './TreeBranch';
import CreateForm from './CreateForm';

function PageList({ root }) {
  const [project] = useContext(ProjectContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [newForm, setNewForm] = useState(null);

  const { setNodeRef } = useDroppable({
    id: 'page-list',
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
      <h2>テキスト</h2>
      <Button onClick={() => switchNewForm('page')}>新規ページ</Button>
      <Button onClick={() => switchNewForm('folder')}>新規フォルダ</Button>
      {newForm === 'page' && (
        <CreateForm createFunc={createNewPage} setStatus={switchNewForm} />
      )}
      {newForm === 'folder' && (
        <CreateForm createFunc={createNewFolder} setStatus={switchNewForm} />
      )}
      <List ref={setNodeRef}>{root && <TreeBranch parentNode={root} />}</List>
    </>
  );
}

export default PageList;
