import { useContext, useState, useRef, useMemo } from 'react';
import { TabListContext } from 'renderer/components/Context';
import { IconButton } from '@mui/material';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import TabItem from './TabItem';
import { ReactComponent as TrackButton } from '../../../../assets/expand.svg';

function TabList({ tabIndex }) {
  const [index, setIndex] = useState(tabIndex);
  const [tabList, setTabList] = useContext(TabListContext);

  return (
    <ul className="tablist" id="tabList">
      <SortableContext items={index} strategy={horizontalListSortingStrategy}>
        {tabList.map((tab) => (
          <TabItem key={`tab-${tab.type}-${tab.id}`} tab={tab} index={index} />
        ))}
      </SortableContext>
      {/* <IconButton
        size="large"
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'rotate(-90deg)',
          backgroundColor: 'white',
          ':hover': {
            backgroundColor: 'white',
          },
        }}
      >
        <TrackButton fontSize="small" />
      </IconButton> */}
    </ul>
  );
}

export default TabList;
