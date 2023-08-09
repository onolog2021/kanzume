import { useContext, useState, useRef, useEffect } from 'react';
import { TabListContext } from 'renderer/components/Context';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import TabItem from './TabItem';

function TabList({ tabIndex }) {
  const [index, setIndex] = useState(tabIndex);
  const [tabList, setTabList] = useContext(TabListContext);

  return (
    <ul className="editorTabList">
      <SortableContext items={index} strategy={horizontalListSortingStrategy}>
        {tabList.map((tab) => (
          <TabItem key={`tab-${tab.type}-${tab.id}`} tab={tab} index={index} />
        ))}
      </SortableContext>
    </ul>
  );
}

export default TabList;
