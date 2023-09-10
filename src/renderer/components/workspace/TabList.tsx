import { useContext, useState, useRef, useEffect } from 'react';
import { TabListContext } from 'renderer/components/Context';
import { IconButton } from '@mui/material';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DndContext } from '@dnd-kit/core';
import TabItem from './TabItem';
import { ReactComponent as TrackButton } from '../../../../assets/expand.svg';

function TabList() {
  const [orderArray, setOrderArray] = useState();
  const [tabList, setTabList] = useContext(TabListContext);
  const tabListRef = useRef();

  useEffect(() => {
    const tabOrderArray = tabList.map((tab) => {
      let dndtagId;
      if (tab.type === 'editor') {
        dndtagId = `te-${tab.id}`;
      } else if (tab.type === 'board') {
        dndtagId = `tb-${tab.id}`;
      } else {
        dndtagId = 'trash';
      }
      return dndtagId;
    });
    setOrderArray(tabOrderArray);
  }, [tabList]);

  const isScrollBar = () => {
    const element = tabListRef.current;
    if (element && element.scrollHeight > element.clientHeight) {
      return true;
    }
    return false;
  };

  const scrollRightList = () => {
    if (tabListRef.current) {
      tabListRef.current.scrollLeft += 320;
    }
  };

  const scrollLeftList = () => {
    if (tabListRef.current) {
      tabListRef.current.scrollLeft -= 320;
    }
  };

  return (
    <ul className="tablist" id="tabList" ref={tabListRef}>
      <IconButton
        onClick={scrollLeftList}
        sx={{
          display: isScrollBar() ? 'block' : 'none',
          position: 'fixed',
          height: 48,
          top: 0,
          left: 'calc(100vw - 240)',
          transform: 'rotate(90deg)',
          backgroundColor: 'white',
          zIndex: 10,
          ':hover': {
            backgroundColor: 'white',
          },
        }}
      >
        <TrackButton fontSize="small" />
      </IconButton>
      {orderArray && (
        <SortableContext
          items={orderArray}
          strategy={horizontalListSortingStrategy}
        >
          {tabList.map((tab) => (
            <TabItem
              key={`tab-${tab.type}-${tab.id}`}
              tab={tab}
              orderArray={orderArray}
            />
          ))}
        </SortableContext>
      )}
      <IconButton
        onClick={scrollRightList}
        sx={{
          display: isScrollBar() ? 'block' : 'none',
          position: 'fixed',
          height: 48,
          top: 0,
          right: 0,
          transform: 'rotate(-90deg)',
          backgroundColor: 'white',
          zIndex: 10,
          ':hover': {
            backgroundColor: 'white',
          },
        }}
      >
        <TrackButton fontSize="small" />
      </IconButton>
    </ul>
  );
}

export default TabList;
