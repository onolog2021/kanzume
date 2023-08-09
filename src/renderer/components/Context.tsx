// src/contexts/CountContexts.jsx

import { useState, createContext, useCallback } from 'react';

export const ProjectContext = createContext([]);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);

  return (
    <ProjectContext.Provider value={[project, setProject]}>
      {children}
    </ProjectContext.Provider>
  );
}

export const CurrentPageContext = createContext([]);

export function CurrentPageProvider({ children }) {
  type CurrentPage = {
    id: number;
    type: string;
  };
  const [currentPage, setCurrentPage] = useState<CurrentPage | null>(null);

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
