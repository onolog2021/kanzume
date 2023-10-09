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
  Box,
} from '@mui/material';
import { ReactComponent as CloseButton } from '../../../../assets/times.svg';
import { ReactComponent as PageIcon } from '../../../../assets/paper.svg';
import { ReactComponent as BoardIcon } from '../../../../assets/board.svg';
import { ReactComponent as TrashIcon } from '../../../../assets/trash.svg';

function TabItem({ tab, orderArray }) {
  const { id, tabId } = tab;
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [isActive, setIsActive] = useState<Boolean>(false);

  let svg;
  if (tab.type === 'editor') {
    svg = <PageIcon />;
  } else if (tab.type === 'board') {
    svg = <BoardIcon />;
  } else {
    svg = <TrashIcon />;
  }

  useEffect(() => {
    if (currentPage) {
      if (currentPage.id === tab.id && tab.type === currentPage.type) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    } else {
      setIsActive(false);
    }
  }, [currentPage]);

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
    if (isActive) {
      setCurrentPage(null);
    }
  };

  function middleClick(event: MouseEvent) {
    if (event.button === 1) {
      closeTab(event);
      event.preventDefault();
    }
  }

  return (
    <ListItemButton
      className={isActive ? 'tab selected' : 'tab'}
      onClick={() => handleActiveTab(id)}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        background: '#E9E9E9;',
        minWidth: tab.type === 'trash' ? 0 : 200,
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
      <Box
        onMouseDown={(event) => middleClick(event)}
        sx={{ display: 'flex', width: '100%' }}
      >
        <ListItemIcon sx={{ minWidth: 24, mr: 1, svg: { width: 16 } }}>
          {svg}
        </ListItemIcon>
        <ListItemText
          primary={tab.title}
          primaryTypographyProps={{
            fontSize: isActive ? 14 : 12,
            fontWeight: isActive ? 'bolder' : 'normal',
          }}
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
      </Box>
    </ListItemButton>
  );
}

export default TabItem;
