import React, { ListItemButton, Typography, Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { useState, useContext, useEffect, ReactElement } from 'react';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import { useTheme } from '@mui/material/styles';
import { ReactComponent as MenuIcon } from '../../../../assets/dots.svg';
import ContextMenu from '../ContextMenu';
import {
  CurrentPageContext,
  SelectedItemElement,
  SidebarSelectedContext,
} from '../Context';
import SortableBorder from './SortableBorder';
import { DndTagElement } from '../../../types/renderElement';

interface contextMenu {
  mouseX: number;
  mouseY: number;
}

function SidebarItem({
  icon,
  text,
  functions,
  dndTag,
  collapse,
}: {
  icon: ReactElement;
  text: string;
  functions: any;
  dndTag: DndTagElement;
  collapse: any;
}) {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const { selectedSidebarItem, setSelectedSidebarItem } = useContext(
    SidebarSelectedContext
  );
  const { click, contextMenu } = functions;
  const [contextMenuStatus, setContextMenuStatus] =
    useState<contextMenu | null>(null);
  // dnd
  const { attributes, listeners, setNodeRef, isOver, index, over, isDragging } =
    useSortable(dndTag);
  const theme = useTheme();
  const { data } = dndTag;

  useEffect(() => {
    // typeとidが同じか
    if (
      data.type === selectedSidebarItem.type &&
      data.id === selectedSidebarItem.id
    ) {
      setIsSelected(true);
      return;
    }
    setIsSelected(false);
  }, [selectedSidebarItem]);

  const style = {
    transition: 'none',
  };

  const borderDndData = { ...dndTag };
  delete borderDndData.position;

  const isFolder = () => {
    if (over) {
      const { type } = over.data.current;
      return type === 'folder';
    }
  };

  const overColor =
    theme.palette.mode === 'dark' ? theme.palette.secondary.dark : '#F2FDFF';
  const overStyle = {
    transition: 'none',
    background: isFolder() ? overColor : 'none',
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

  function overrideClick(originalClick: any) {
    return () => {
      originalClick();

      if (data.type !== 'paper' && data.itemType !== 'border' && data.id) {
        const selectedData: SelectedItemElement = {
          type: data.type,
          id: data.id,
          parentId: data.parentId ? data.parentId : null,
        };
        setSelectedSidebarItem(selectedData);
      }
    };
  }

  return (
    <Box>
      {index === 0 ? <SortableBorder tag={borderDndData} index={0} /> : null}
      <ListItemButton
        onClick={overrideClick(click)}
        sx={{
          px: 1,
          display: 'grid',
          opacity: isDragging ? 0.4 : 1,
          gridTemplateColumns: '24px 1fr',
          gap: 1,
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
            fontWeight: isSelected ? 'bolder' : 'normal',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1,
            overflow: 'hidden',
            wordBreak: 'break-all',
          }}
        >
          {text}
        </Typography>
        <PlaneIconButton
          onClick={contextMenuOpen}
          sx={{
            display: 'none',
            width: 24,
            height: 24,
            p: 0,
          }}
        >
          <MenuIcon />
        </PlaneIconButton>
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
