// src/contexts/CountContexts.jsx

import React, { useState, createContext, useCallback } from 'react';
import { TabListElement } from '../../types/renderElement';

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
  const [tabList, setTabList] = useState<TabListElement[]>([]);

  const addTab = useCallback(
    (newTab: TabListElement) => {
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

export type ColumnsStateElement = {
  fullWidth: number;
  columns: number;
};

const initialColumnsState = { fullWidth: 0, columns: 1 };
export const ColumnsContext = createContext(initialColumnsState);
