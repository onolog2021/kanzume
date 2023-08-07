import { useState, useContext } from 'react';
import { TabListContext, CurrentPageContext } from '../Context';
import TabList from './TabList';
import EditorBody from './Editor/EditorBody';
import BoardBody from './Board/BoardBody';

function WorkSpace({ tabs, paperIndex }) {
  const [tabList, setTabList] = useContext(TabListContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);

  const isCurrent = (tab) => {
    return tab.id === currentPage.id && tab.type === currentPage.type
      ? { display: 'block' }
      : { display: 'none' };
  };

  return (
    <div className="workSpace">
      {tabs}
      {tabList &&
        tabList.map((tab) =>
          tab.type === 'editor' ? (
            <div style={isCurrent(tab)} key={`page-${tab.id}`}>
              <EditorBody targetId={`tab-${tab.id}`} page_id={tab.id} />
            </div>
          ) : (
            <div style={isCurrent(tab)} key={`board-${tab.id}`}>
              <BoardBody boardData={tab} paperIndex={paperIndex} />
            </div>
          )
        )}
    </div>
  );
}

export default WorkSpace;
