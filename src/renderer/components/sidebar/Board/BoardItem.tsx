import { useContext } from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CurrentPageContext } from 'renderer/components/Context';
// import Folder from 'renderer/Classes/Folder';
import { TabListContext } from 'renderer/components/Context';
import { ReactComponent as BoardLogo } from '../../../../../assets/square.svg';
import SidebarItem from '../SidebarItem';

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

  async function handleClick() {
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

  const icon = <BoardLogo />;

  const functions = {
    click: handleClick,
  };

  return <SidebarItem icon={icon} text={board.title} functions={functions} />;
}

export default BoadItem;
