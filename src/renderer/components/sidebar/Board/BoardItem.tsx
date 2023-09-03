import { useContext } from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CurrentPageContext } from 'renderer/components/Context';
// import Folder from 'renderer/Classes/Folder';
import { TabListContext } from 'renderer/components/Context';
import { ReactComponent as BoardLogo } from '../../../../../assets/square.svg';

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

  async function handleClick(board: Object) {
    await setCurrentPage({ id: board.id, type: 'board' });
    const value = {
      id: board.id,
      title: board.title,
      type: 'board',
      tabId: `tab-board-${board.id}`,
      parentId: board.id,
    };
    if (
      tabList.length === 0 ||
      !tabList.some((item) => item.tabId === value.tabId)
    ) {
      await setTabList((prevTabs) => [...prevTabs, value]);
    }
  }

  return (
    <ListItemButton
      onClick={() => handleClick(board)}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      sx={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr',
        gap: 1,
        height: 40,
        alignItems: 'center',
      }}
    >
      <BoardLogo style={{ width: 16, margin: '0 auto' }} />
      <ListItemText primary={board.title} />
    </ListItemButton>
  );
}

export default BoadItem;
