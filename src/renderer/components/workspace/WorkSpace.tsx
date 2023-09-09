import { useState, useContext, useRef, useEffect } from 'react';
import { TabListContext, CurrentPageContext } from '../Context';
import EditorBody from './Editor/EditorBody';
import BoardSpace from './Board/BoardSpace';
import TrashBox from './Trash/TrashBox';
import TabList from './TabList';

function WorkSpace() {
  const [tabList, setTabList] = useContext(TabListContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);

  const isCurrent = (tab) => {
    return tab.id === currentPage.id && tab.type === currentPage.type
      ? { display: 'block' }
      : { display: 'none' };
  };

  const panelRender = (tab) => {
    let content;
    switch (tab.type) {
      case 'editor':
        content = (
          <div style={isCurrent(tab)} key={`page-${tab.id}`} className="panel">
            <EditorBody
              targetId={`tab-${tab.id}`}
              page_id={tab.id}
              title={tab.title}
            />
          </div>
        );
        break;
      case 'board':
        content = (
          <div style={isCurrent(tab)} key={`board-${tab.id}`} className="panel">
            <BoardSpace boardData={tab} />
          </div>
        );
        break;
      case 'trash':
        content = (
          <div style={isCurrent(tab)} key="trash-box" className="panel">
            <TrashBox />
          </div>
        );
        break;
      default:
    }
    return content;
  };

  return (
    <div className="workSpace">
      <TabList />
      {tabList && tabList.map((tab) => panelRender(tab))}
    </div>
  );
}

export default WorkSpace;
