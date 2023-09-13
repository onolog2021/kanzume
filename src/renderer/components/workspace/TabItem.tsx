import { useContext, useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import {
  CurrentPageContext,
  TabListContext,
} from 'renderer/components/Context';
import { CSS } from '@dnd-kit/utilities';
import {
  IconButton,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { ReactComponent as CloseButton } from '../../../../assets/times.svg';
import { ReactComponent as PageIcon } from '../../../../assets/paper.svg';
import { ReactComponent as BoardIcon } from '../../../../assets/board.svg';

function TabItem({ tab, orderArray }) {
  const { id, tabId } = tab;
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);

  const svg = tab.type === 'editor' ? <PageIcon /> : <BoardIcon />;

  const { attributes, listeners, setNodeRef } = useSortable({
    id: tabId,
    data: {
      area: 'tab',
      type: 'trash',
      id: tab.id,
      orderArray,
      content: tab.title,
    },
  });

  const style = {};

  const handleActiveTab = (id: number) => {
    const value = { id, type: tab.type };
    setCurrentPage(value);
  };

  const closeTab = (event) => {
    event.stopPropagation();
    const closedTabIndex = tabList.findIndex(
      (item) => item.tabId === tab.tabId
    );
    const newTabList = [...tabList];
    newTabList.splice(closedTabIndex, 1);
    setTabList(newTabList);
  };

  return (
    <ListItemButton
      className={currentPage.id === id ? 'tab selected' : 'tab'}
      onClick={() => handleActiveTab(id)}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      sx={{
        background: '#E9E9E9;',
        minWidth: 200,
        height: 48,
        lineHeight: '48px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        mr: 0.5,
        button: {
          display: 'none',
        },
        ':hover': {
          button: {
            display: 'block',
          },
        },
      }}
    >
      <ListItemIcon>{svg}</ListItemIcon>
      <ListItemText
        primary={tab.title}
        primaryTypographyProps={{ fontSize: 12 }}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          webkitBoxOrient: 'vertical',
          webkitLineClamp: 1,
        }}
      />
      <IconButton
        onClick={closeTab}
        sx={{
          position: 'absolute',
          right: 2,
          height: 48,
          top: 0,
          ':hover': {
            background: 'transparent',
          },
        }}
      >
        <CloseButton style={{ fill: 'gray', width: 12, height: 12 }} />
      </IconButton>
    </ListItemButton>
  );
}

export default TabItem;
