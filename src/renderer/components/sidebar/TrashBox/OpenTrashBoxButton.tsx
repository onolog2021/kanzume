import { useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { IconButton, Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import {
  CurrentPageContext,
  TabListContext,
} from 'renderer/components/Context';
import { ReactComponent as TraxhBoxIcon } from '../../../../../assets/trash.svg';

function OpenTrashBoxButton() {
  const theme = useTheme();
  const { tabList, addTab } = useContext(TabListContext);
  const { setCurrentPage } = useContext(CurrentPageContext);

  const { setNodeRef, isOver } = useDroppable({
    id: 'sidebar-trashbox',
    data: { area: 'trash', type: 'area' },
  });

  const addTabList = () => {
    const newTab = {
      id: 0,
      title: '',
      type: 'trash',
      tabId: 'tab-trash',
    };
    if (!tabList.some((item) => item.type === 'trash')) {
      addTab(newTab);
    }
    setCurrentPage({ id: 0, type: 'trash' });
  };

  const overStyle = isOver
    ? {
        transform: 'scale(1.5)',
        svg: {
          fill: theme.palette.primary.main,
        },
      }
    : null;

  return (
    <Box
      ref={setNodeRef}
      sx={{ width: 'fit-content', display: 'block', mt: 'auto', ...overStyle }}
    >
      <IconButton onClick={addTabList} aria-label="削除">
        <TraxhBoxIcon />
      </IconButton>
    </Box>
  );
}

export default OpenTrashBoxButton;
