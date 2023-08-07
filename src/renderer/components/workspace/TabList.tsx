import { useContext, useState, useRef, useEffect } from 'react';
import {
  CurrentPageContext,
  ProjectContext,
  PageListContext,
  TabListContext,
} from 'renderer/components/Context';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import TabItem from './TabItem';

function TabList({ tabIndex }) {
  const [project] = useContext(ProjectContext);
  const [pageList, setPageList] = useContext(PageListContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);

  return (
    <ul className="editorTabList">
      <SortableContext
        items={tabIndex}
        strategy={horizontalListSortingStrategy}
      >
        {tabList.map((tab) => (
          <TabItem key={`tab-${tab.type}-${tab.id}`} tab={tab} index={tabIndex} />
        ))}
      </SortableContext>
    </ul>
  );
}

export default TabList;
