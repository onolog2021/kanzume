import { IconButton, ListItemButton, Typography } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { useState } from 'react';
import { ReactComponent as MenuIcon } from '../../../../assets/dots.svg';
import ContextMenu from '../ContextMenu';

interface contextMenu {
  mouseX: number;
  mouseY: number;
}

function SidebarItem({ icon, text, functions, dndTag }) {
  const { click, contextMenu } = functions;
  const [contextMenuStatus, setContextMenuStatus] =
    useState<contextMenu | null>(null);

  // dnd
  const {
    attributes,
    listeners,
    setNodeRef,
    isOver,
    active,
    over,
    transform,
    transition,
    isDragging,
    index,
  } = useSortable(dndTag);

  const style = {
    transition: 'none',
  };

  const overStyle = {
    transition: 'none',
    borderBottom: '0.1px solid blue',
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
    <>
      <ListItemButton
        onClick={click}
        sx={{
          p: 1,
          display: 'grid',
          gridTemplateColumns: '24px 1fr',
          gap: 1,
          height: 40,
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
      {contextMenuStatus && (
        <ContextMenu
          contextMenu={contextMenuStatus}
          onClose={contextMenuClose}
          menues={contextMenu}
        />
      )}
    </>
  );
}

export default SidebarItem;
