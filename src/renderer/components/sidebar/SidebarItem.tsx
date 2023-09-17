import { IconButton, ListItemButton, Typography, Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { useState, useContext, useEffect } from 'react';
import { ReactComponent as MenuIcon } from '../../../../assets/dots.svg';
import ContextMenu from '../ContextMenu';
import { CurrentPageContext } from '../Context';
import SortableBorder from './SortableBorder';

interface contextMenu {
  mouseX: number;
  mouseY: number;
}

function SidebarItem({ icon, text, functions, dndTag, collapse }) {
  const [selected, setSelected] = useState();
  const [position, setPosition] = useState();
  const { click, contextMenu } = functions;
  const [contextMenuStatus, setContextMenuStatus] =
    useState<contextMenu | null>(null);
  const [currentPage] = useContext(CurrentPageContext);
  // dnd
  const { attributes, listeners, setNodeRef, isOver, index } =
    useSortable(dndTag);

  useEffect(() => {
    if (currentPage) {
      if (currentPage.id === dndTag.data.id) {
        if (
          (currentPage.type === 'editor' && dndTag.data.type === 'page') ||
          currentPage.type === dndTag.data.type
        ) {
          setSelected(true);
        }
      } else {
        setSelected(false);
      }
    }
  }, [currentPage]);

  const style = {
    transition: 'none',
  };

  const borderDndData = { ...dndTag };
  delete borderDndData.position;

  const overStyle = {
    transition: 'none',
    // backgroundColor: 'tomato',
    // borderBottom: '0.1px solid blue',
  };

  const contextMenuOpen = (event) => {
    event.stopPropagation();
    setContextMenuStatus(
      contextMenuStatus === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };

  const contextMenuClose = () => {
    setContextMenuStatus(null);
  };

  return (
    <Box>
      {index === 0 ? <SortableBorder tag={borderDndData} index={0} /> : null}
      <ListItemButton
        onClick={click}
        sx={{
          px: 1,
          py: 0,
          display: 'grid',
          gridTemplateColumns: '24px 1fr',
          gap: 1,
          height: 24,
          alignItems: 'center',
          svg: {
            width: 16,
            margin: '0 auto',
          },
          ':hover': {
            gridTemplateColumns: '24px 1fr 24px',
            button: {
              display: 'block',
            },
          },
        }}
        ref={setNodeRef}
        style={isOver ? overStyle : style}
        {...listeners}
        {...attributes}
      >
        {icon}
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: selected ? 'bolder' : 'normal',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1,
            overflow: 'hidden',
            wordBreak: 'break-all',
          }}
        >
          {text}
        </Typography>
        <IconButton
          onClick={contextMenuOpen}
          sx={{
            display: 'none',
            width: 24,
            height: 24,
            background: 'white',
            p: 0,
          }}
        >
          <MenuIcon />
        </IconButton>
      </ListItemButton>
      {collapse && collapse}
      <SortableBorder tag={borderDndData} index={index + 1} />

      {contextMenuStatus && (
        <ContextMenu
          contextMenu={contextMenuStatus}
          onClose={contextMenuClose}
          menues={contextMenu}
        />
      )}
    </Box>
  );
}

export default SidebarItem;
