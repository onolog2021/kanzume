import React, { useState, useContext, useRef, useEffect } from 'react';
import { TabListContext, CurrentPageContext, TabListElement } from '../Context';
import EditorBody from './Editor/EditorBody';
import BoardSpace from './Board/BoardSpace';
import TrashBox from './Trash/TrashBox';
import TabList from './TabList';
import NoSpace from './NoSpace';
import BoardProvider from './Board/BoardProvider';
import PreviewTab from './Preview/PreviewTab';
import HistorySpace from './History/HistorySpace';

function WorkSpace() {
  const { tabList, setTabList } = useContext<TabListElement>(TabListContext);
  const { currentPage } = useContext(CurrentPageContext);

  const isCurrent = (tab) => {
    if (currentPage === null) {
      return;
    }
    return tab.id === currentPage.id && tab.type === currentPage.type
      ? { display: 'block', minHeight: window.innerHeight, paddingTop: 80 }
      : { display: 'none' };
  };

  const panelRender = (tab) => {
    let content;
    switch (tab.type) {
      case 'editor':
        content = (
          <div style={isCurrent(tab)} key={`page-${tab.id}`} className="panel">
            <EditorBody
              targetId={tab.tabId}
              page_id={tab.id}
              title={tab.title}
            />
          </div>
        );
        break;
      case 'board':
        content = (
          <div style={isCurrent(tab)} key={`board-${tab.id}`} className="panel">
            <BoardProvider tab={tab} />
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
      case 'preview':
        content = (
          <div
            style={isCurrent(tab)}
            key={`preview-${tab.id}`}
            className="panel"
          >
            <PreviewTab tab={tab} />
          </div>
        );
        break;
      case 'history':
        content = (
          <div
            style={isCurrent(tab)}
            key={`history-${tab.id}`}
            className="panel"
          >
            <HistorySpace pageId={tab.id} />
          </div>
        );
        break;
      default:
    }
    return content;
  };

  if (tabList && tabList.length === 0) {
    return <NoSpace />;
  }

  return (
    <div className="workSpace" style={{ minHeight: window.innerHeight }}>
      <TabList />
      {tabList && tabList.map((tab) => panelRender(tab))}
    </div>
  );
}

export default WorkSpace;
