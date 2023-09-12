import { useContext } from 'react';
import { IconButton, Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import {
  CurrentPageContext,
  TabListContext,
} from 'renderer/components/Context';
import { ReactComponent as TraxhBoxIcon } from '../../../../../assets/trash.svg';

function OpenTrashBoxButton() {
  const [tabList, setTabList] = useContext(TabListContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);

  const { setNodeRef } = useDroppable({
    id: 'sidebar-trashbox',
    data: { area: 'trash', type: 'area' },
  });

  const addTabList = () => {
    const value = {
      id: 0,
      title: 'ゴミ箱',
      type: 'trash',
      tabId: 'tab-trash',
    };
    if (!tabList.some((item) => item.type === 'trash')) {
      setTabList((prevTabs) => [...prevTabs, value]);
    }
    setCurrentPage({ id: 0, type: 'trash' });
  };

  return (
    <Box
      ref={setNodeRef}
      sx={{ width: 'fit-content', display: 'block', mt: 'auto' }}
    >
      <IconButton onClick={addTabList} aria-label="削除">
        <TraxhBoxIcon />
      </IconButton>
    </Box>
  );
}

export default OpenTrashBoxButton;
