import { useContext } from 'react';
import { List, Button } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import Folder from 'renderer/Classes/Folder';
import {
  ProjectContext,
  CurrentPageContext,
  TabListContext,
} from '../../Context';
import TreeBranch from './TreeBranch';

function PageList({ root }) {
  const [project] = useContext(ProjectContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);

  const { setNodeRef } = useDroppable({
    id: 'page-list',
  });

  async function createNewPage() {
    const newTitle = '無題';
    const newId = await window.electron.ipcRenderer.invoke('createNewPage', [
      project.id,
      newTitle,
    ]);
    await window.electron.ipcRenderer.sendMessage('updatePageList', project.id);
    const newTab = {
      id: newId,
      title: '無題',
      type: 'editor',
      tabId: `tab-editor-${newId}`,
    };
    setTabList((prevList) => {
      prevList.push(newTab);
      return prevList;
    });
    setCurrentPage({ id: newId, type: 'editor' });
  }

  async function createNewFolder() {
    const newFolder = new Folder({
      title: '無題のフォルダ',
      project_id: project.id,
    });
    await newFolder.create();
    await window.electron.ipcRenderer.sendMessage('updatePageList', project.id);
  }

  if (!root) {
    return <h1>Now Loading...</h1>;
  }

  return (
    <>
      <h1>{project.title}</h1>
      <h2>テキスト</h2>
      <Button onClick={() => createNewPage()}>新規ページ</Button>
      <Button onClick={() => createNewFolder()}>新規フォルダ</Button>
      <List ref={setNodeRef}>
        {root ? <TreeBranch parentNode={root} /> : null}
      </List>
    </>
  );
}

export default PageList;
