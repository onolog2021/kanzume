import { Button, List } from '@mui/material';
import { useEffect, useState, useContext } from 'react';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import Folder from 'renderer/Classes/Folder';
import { ProjectContext } from '../../Context';
import BoardItem from './BoardItem';

function Board({ boards, boardIndex }) {
  const [project] = useContext(ProjectContext);

  function createNewBoard() {
    const newBoard = new Folder({
      title: '新しいボード',
      project_id: project.id,
      type: 'board',
    });
    newBoard.create();
  }

  if (!boards) {
    <h3>Now Loading...</h3>;
  }

  return (
    <>
      <h2>ボード</h2>
      <Button onClick={() => createNewBoard()}>新しいボード</Button>
      <SortableContext items={boardIndex}>
        <List>
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
