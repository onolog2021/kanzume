import { useContext, useState,  useEffect } from 'react';
import {
  CurrentPageContext,
  ProjectContext,
  TabListContext,
} from 'renderer/components/Context';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, IconButton, Tab } from '@mui/material';
import {ReactComponent as CloseButton} from '../../../../assets/times.svg'

function TabItem({ tab, index }) {
  const [project] = useContext(ProjectContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [title, setTitle] = useState<string>(tab.title);
  const { id } = tab;
  const [input, setInput] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: tab.tabId,
    data: { type: 'tab', itemId: id, index },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleActiveTab = (id: number) => {
    const value = { id, type: tab.type };
    setCurrentPage(value);
  };

  const closeTab = (event) => {
    event.stopPropagation();
    const closedTabIndex = tabList.findIndex((item) => item.tabId === tab.tabId);
    const newTabList = [...tabList];
    newTabList.splice(closedTabIndex, 1);
    setTabList(newTabList);
  }

  return (
    <div
      className={currentPage.id === id ? 'tab selected' : 'tab'}
      onClick={() => handleActiveTab(id)}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <p>{title}</p>
      <IconButton
        onClick={closeTab}
        sx={{
          position: 'absolute',
          right: 2,
          height: 48,
          top: 0,
          ":hover": {
            background: 'transparent'
          }
        }}
      >
        <CloseButton style={{fill: 'gray', width: 12, height: 12}}/>
      </IconButton>
    </div>
  );
}

export default TabItem;
