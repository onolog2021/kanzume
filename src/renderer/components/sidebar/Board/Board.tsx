import { Button, List } from '@mui/material';
import { useEffect, useState, useContext } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import Folder from 'renderer/Classes/Folder';
import {
  CurrentPageContext,
  ProjectContext,
  TabListContext,
} from '../../Context';
import BoardItem from './BoardItem';

function Board({ boards, boardIndex }) {
  const [project] = useContext(ProjectContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);

  const { setNodeRef } = useDroppable({
    id: 'board-list',
  });

  async function createNewBoard() {
    const newBoard = new Folder({
      title: '新しいボード',
      project_id: project.id,
      type: 'board',
    });
    const newId = await newBoard.create();
    await window.electron.ipcRenderer.sendMessage(
      'updateBoardList',
      project.id
    );
    const value = {
      id: newId,
      tabId: `tab-board-${newId}`,
      title: '新しいボード',
      type: 'board',
    };
    setTabList((prevTab) => {
      prevTab.push(value);
      return prevTab;
    });
    const current = { id: newId, type: 'board' };
    setCurrentPage(current);
  }

  if (!boards) {
    <h3>Now Loading...</h3>;
  }

  return (
    <>
      <h2>ボード</h2>
      <Button onClick={() => createNewBoard()}>新しいボード</Button>
      <SortableContext items={boardIndex}>
        <List ref={setNodeRef}>
          {boards &&
            boards.map((board) => (
              <BoardItem key={board.id} board={board} index={boardIndex} />
            ))}
        </List>
      </SortableContext>
    </>
  );
}

export default Board;
