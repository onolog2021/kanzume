import { useState, useEffect, useContext } from 'react';
import { List, Button } from '@mui/material';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import Project from 'renderer/Classes/Project';
import Folder from 'renderer/Classes/Folder';
import Node from 'renderer/Classes/Node';
import { collectNames } from 'renderer/components/GlobalMethods';
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

  useEffect(() => {
    window.electron.ipcRenderer.on('updatePageList', (event) => {
      console.log(event);
    });
  },[])

  async function createNewPage() {
    const newTitle = '無題';
    const getNewId = await window.electron.ipcRenderer.invoke('createNewPage', [
      project.id,
      newTitle,
    ]);
    const value = {
      id: getNewId,
      title: newTitle,
      type: 'editor',
    };
    if (
      !tabList.some((item) => item.id === value.id && item.type === 'editor')
    ) {
      setTabList((prevTabs) => [...prevTabs, value]);
    }
    setCurrentPage(getNewId);
  }

  async function createNewFolder() {
    const newFolder = new Folder({
      title: '無題のフォルダ',
      project_id: project.id,
    });
    newFolder.create();
    getTree(project);
  }

  if (!root) {
    return <h1>Now Loading...</h1>;
  }

  return (
    <>
      <h1>{project.title}</h1>
      <h2>テキスト</h2>
      <Button onClick={() => createNewPage()}>新規ページ</Button>
      <Button onClick={() => createNewFolder()}>新規ページ</Button>
      <List>{root ? <TreeBranch parentNode={root} /> : null}</List>
    </>
  );
}

export default PageList;
