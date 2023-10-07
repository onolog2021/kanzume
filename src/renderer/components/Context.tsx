// src/contexts/CountContexts.jsx

import { useState, createContext, useCallback } from 'react';

export const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);

  return (
    <ProjectContext.Provider value={[project, setProject]}>
      {children}
    </ProjectContext.Provider>
  );
}

export const CurrentPageContext = createContext([]);

export type CurrentPageData = {
  id: number;
  type: string;
  parentId: number | null;
};

export function CurrentPageProvider({ children }) {
  const [currentPage, setCurrentPage] = useState<CurrentPageData | null>(null);

  return (
    <CurrentPageContext.Provider value={[currentPage, setCurrentPage]}>
      {children}
    </CurrentPageContext.Provider>
  );
}

export const TabListContext = createContext([]);

export function TabListProvider({ children }) {
  interface tabData {
    id: number;
    title: string;
    type: 'editor' | 'board';
    tabId: string;
  }
  const [tabList, setTabList] = useState<tabData[]>([]);

  const addTab = useCallback(
    (newTab: tabData) => {
      // Check for duplication based on tabId
      if (!tabList.some((tab) => tab.tabId === newTab.tabId)) {
        setTabList((prevTabs) => [...prevTabs, newTab]);
      }
    },
    [tabList]
  );

  return (
    <TabListContext.Provider value={[tabList, setTabList]}>
      {children}
    </TabListContext.Provider>
  );
}
