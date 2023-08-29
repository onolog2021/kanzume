import { useContext } from 'react';
import { IconButton } from '@mui/material';
import {
  CurrentPageContext,
  TabListContext,
} from 'renderer/components/Context';
import { ReactComponent as TraxhBoxIcon } from '../../../../../assets/trash.svg';

function OpenTrashBoxButton() {
  const [tabList, setTabList] = useContext(TabListContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
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
    <IconButton onClick={addTabList} aria-label="削除">
      <TraxhBoxIcon />
    </IconButton>
  );
}

export default OpenTrashBoxButton;
