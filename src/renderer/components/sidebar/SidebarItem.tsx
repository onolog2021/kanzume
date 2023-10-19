import { IconButton, ListItemButton, Typography, Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { useState, useContext, useEffect } from 'react';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import { ReactComponent as MenuIcon } from '../../../../assets/dots.svg';
import ContextMenu from '../ContextMenu';
import { CurrentPageContext } from '../Context';
import SortableBorder from './SortableBorder';
import { useTheme } from '@mui/material/styles';

interface contextMenu {
  mouseX: number;
  mouseY: number;
}

function SidebarItem({ icon, text, functions, dndTag, collapse }) {
  const [selected, setSelected] = useState<Boolean>(false);
  const { click, contextMenu } = functions;
  const [contextMenuStatus, setContextMenuStatus] =
    useState<contextMenu | null>(null);
  const [currentPage] = useContext(CurrentPageContext);
  // dnd
  const { attributes, listeners, setNodeRef, isOver, index, over, isDragging } =
    useSortable(dndTag);
  const theme = useTheme();

  useEffect(() => {
    if (!currentPage) {
      setSelected(false);
      return;
    }

    const isSameId = currentPage.id === dndTag.data.id;
    const isMatchingType =
      (currentPage.type === 'editor' && dndTag.data.type === 'page') ||
      currentPage.type === dndTag.data.type;

    setSelected(isSameId && isMatchingType);
  }, [currentPage]);

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

  const overColor = theme.palette.mode === 'dark' ? theme.palette.secondary.dark : '#F2FDFF';
  const overStyle = {
    transition: 'none',
    background: isFolder() ?  overColor : 'none',
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
