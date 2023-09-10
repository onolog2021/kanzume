import { Button, List, IconButton } from '@mui/material';
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
import CreateForm from '../PageList/CreateForm';
import CategoryTitle from '../CategoryTitle';
import { ReactComponent as BoardIcon } from '../../../../../assets/board.svg';
import { ReactComponent as AddBoardButton } from '../../../../../assets/grid-plus.svg';

function BoardList({ boards }) {
  const [project] = useContext(ProjectContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [formDisplay, setFormDisplay] = useState(null);
  const [orderArray, setOrderArray] = useState();
  const svg = <BoardIcon />;

  const switchFormDisplay = (status: string) => {
    setFormDisplay(status);
  };

  const { setNodeRef } = useDroppable({
    id: 'board-list',
    data: { area: 'boardList' },
  });

  useEffect(() => {
    const boardOrderArray = boards.map((board) => `b-${board.id}`);
    setOrderArray(boardOrderArray);
  }, []);

  const createNewBoard = async (title: string) => {
    const newBoard = new Folder({
      title,
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
      title,
      type: 'board',
    };
    setTabList((prevTab) => {
      prevTab.push(value);
      return prevTab;
    });
    const current = { id: newId, type: 'board' };
    setCurrentPage(current);
  };

  if (!boards) {
    <h3>Now Loading...</h3>;
  }

  return (
    <>
      <div className="sideBarSectionName">
        <CategoryTitle svg={svg} categoryName="ボード" />
        <IconButton onClick={() => switchFormDisplay('board')}>
          <AddBoardButton />
        </IconButton>
      </div>

      {formDisplay && (
        <CreateForm
          createFunc={createNewBoard}
          setStatus={switchFormDisplay}
          label="ボード名"
        />
      )}
      {orderArray && (
        <List ref={setNodeRef}>
          <SortableContext items={orderArray}>
            {orderArray &&
              boards.map((board) => (
                <BoardItem
                  key={board.id}
                  board={board}
                  orderArray={orderArray}
                  bookmark={false}
                />
              ))}
          </SortableContext>
        </List>
      )}
    </>
  );
}

export default BoardList;
