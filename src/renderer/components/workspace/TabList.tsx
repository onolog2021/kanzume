import { useContext, useState, useRef, useEffect } from 'react';
import { TabListContext } from 'renderer/components/Context';
import { Box } from '@mui/material';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import { useTheme } from '@mui/material/styles';
import TabItem from './TabItem';
import { ReactComponent as TrackButton } from '../../../../assets/expand.svg';

function TabList() {
  const [orderArray, setOrderArray] = useState();
  const { tabList } = useContext(TabListContext);
  const tabListRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const tabOrderArray = tabList.map((tab) => {
      let dndtagId;
      if (tab.type === 'trash') {
        dndtagId = 'tab-trash';
      } else {
        dndtagId = `tab-${tab.type}-${tab.id}`;
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
    <Box
      className="tablist"
      id="tabList"
      ref={tabListRef}
      sx={{
        '&:hover': {
          '.tabListScrollButton': {
            display: isScrollBar() ? 'block' : 'none',
          },
        },
      }}
    >
      <PlaneIconButton
        className="tabListScrollButton"
        onClick={scrollLeftList}
        sx={{
          display: 'none',
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
      </PlaneIconButton>
      {orderArray && (
        <SortableContext
          items={orderArray}
          strategy={horizontalListSortingStrategy}
        >
          {tabList.map((tab, index: number) => (
            <TabItem key={index} tab={tab} orderArray={orderArray} />
          ))}
        </SortableContext>
      )}
      <PlaneIconButton
        className="tabListScrollButton"
        onClick={scrollRightList}
        sx={{
          display: 'none',
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
      </PlaneIconButton>
    </Box>
  );
}

export default TabList;
