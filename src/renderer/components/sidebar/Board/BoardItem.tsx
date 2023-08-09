import { useContext } from 'react';
import { ListItemButton, ListItemText } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CurrentPageContext } from 'renderer/components/Context';
// import Folder from 'renderer/Classes/Folder';
import { TabListContext } from 'renderer/components/Context';

function BoadItem({ board, index }) {
  // const thisFolder = new Folder(folder);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `board-${board.id}`,
      data: { type: 'board', area: 'board-list', itemId: board.id, index },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleClick(board: Object) {
    const value = {
      id: board.id,
      title: board.title,
      type: 'board-list',
      tabId: `tab-board-${board.id}`,
      parentId: board.id,
    };
    if (
      tabList.length === 0 ||
      !tabList.some((item) => item.tabId === value.tabId)
    ) {
      setTabList((prevTabs) => {
        prevTabs.push(value);
        return prevTabs;
      });
    }
    setCurrentPage({ id: board.id, type: 'board' });
  }

  return (
    <ListItemButton
      onClick={() => handleClick(board)}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <ListItemText primary={board.title} />
    </ListItemButton>
  );
}

export default BoadItem;
