// src/contexts/CountContexts.jsx

import { useState, createContext } from 'react';

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

export const PageListContext = createContext([]);

export function PageListProvider({ children }) {
  const [pageList, setPageList] = useState(null);

  return (
    <PageListContext.Provider value={[pageList, setPageList]}>
      {children}
    </PageListContext.Provider>
  );
}

export const TabListContext = createContext([]);

export function TabListProvider({ children }) {
  interface tabData {
    id: number;
    title: string;
    type: string;
  }
  const [tabList, setTabList] = useState<tabData[]>([]);

  return (
    <TabListContext.Provider value={[tabList, setTabList]}>
      {children}
    </TabListContext.Provider>
  );
}
