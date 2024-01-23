import React, { useContext, useEffect, useState } from 'react';
import { TabListContext, CurrentPageContext, TabListElement } from '../Context';
import EditorBody from './Editor/EditorBody';
import TrashBox from './Trash/TrashBox';
import TabList from './TabList';
import NoSpace from './NoSpace';
import BoardProvider from './Board/BoardProvider';
import PreviewTab from './Preview/PreviewTab';
import HistorySpace from './History/HistorySpace';

function WorkSpace() {
  const { tabList } = useContext<TabListElement>(TabListContext);
  const { currentPage } = useContext(CurrentPageContext);
  const [panel, setPanel] = useState();
  const noSpace = <NoSpace />;

  // 現在表示中のタブ
  useEffect(() => {
    if (!currentPage) {
      setPanel(noSpace);
      return;
    }
    const nowTab = tabList.find(
      (item) => item.id === currentPage.id && item.type === currentPage.type
    );
    if (nowTab) {
      const tmp = panelRender(nowTab);
      setPanel(tmp);
    }
  }, [currentPage, tabList]);

  const panelStyle = {
    display: 'block',
    minHeight: window.innerHeight,
    paddingTop: 80,
  };

  function panelRender(tab) {
    let content;
    switch (tab.type) {
      case 'editor':
        content = (
          <div style={panelStyle} key={`page-${tab.id}`} className="panel">
            <EditorBody page_id={tab.id} />
          </div>
        );
        break;
      case 'board':
        content = (
          <div style={panelStyle} key={`board-${tab.id}`} className="panel">
            <BoardProvider tab={tab} />
          </div>
        );
        break;
      case 'trash':
        content = (
          <div style={panelStyle} key="trash-box" className="panel">
            <TrashBox />
          </div>
        );
        break;
      case 'preview':
        content = (
          <div style={panelStyle} key={`preview-${tab.id}`} className="panel">
            <PreviewTab tab={tab} />
          </div>
        );
        break;
      case 'history':
        content = (
          <div style={panelStyle} key={`history-${tab.id}`} className="panel">
            <HistorySpace pageId={tab.id} />
          </div>
        );
        break;
      default:
    }
    return content;
  }

  if (tabList && tabList.length === 0) {
    return <>{noSpace}</>;
  }

  return (
    <div className="workSpace" style={{ minHeight: window.innerHeight }}>
      <TabList />
      {panel && panel}
    </div>
  );
}

export default WorkSpace;
