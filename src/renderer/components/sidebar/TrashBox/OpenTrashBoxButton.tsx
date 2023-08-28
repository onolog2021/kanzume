import {useContext} from 'react'
import { Button } from '@mui/material';
import { CurrentPageContext, TabListContext } from 'renderer/components/Context';

function OpenTrashBoxButton() {
  const [tabList, setTabList] = useContext(TabListContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext)
  const addTabList = () => {
    const value = {
      id: 0,
      title: 'ゴミ箱',
      type: 'trash',
      tabId: 'tab-trash',
    };
    if (
      !tabList.some((item) => item.type === 'trash')
    ) {
      setTabList((prevTabs) => [...prevTabs, value]);
    }
    setCurrentPage({ id: 0, type: 'trash' });
  };

  return <Button onClick={addTabList}>ゴミ箱</Button>;
}

export default OpenTrashBoxButton;
