// src/contexts/CountContexts.jsx

import React, {
  useState,
  createContext,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
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

export type CurrentPageElement = {
  id: number;
  type: 'board' | 'editor' | 'trash';
  parentId: number | null;
};

export function CurrentPageProvider({ children }) {
  const [currentPage, setCurrentPage] = useState<CurrentPageElement | null>(
    null
  );

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

const initialColumnsState: ColumnsStateElement = {
  fullWidth: 0,
  columns: 0,
};

export const ColumnsContext = createContext<{
  columnsState: ColumnsStateElement;
  setColumnsState: React.Dispatch<React.SetStateAction<ColumnsStateElement>>;
}>({
  columnsState: initialColumnsState,
  setColumnsState: () => {},
});

export function ColumnsStateProvider({ children }: { children: ReactNode }) {
  const [columnsState, setColumnsState] =
    useState<ColumnsStateElement>(initialColumnsState);

  const contextValue = useMemo(
    () => ({
      columnsState,
      setColumnsState,
    }),
    [columnsState, setColumnsState]
  );

  return (
    <ColumnsContext.Provider value={contextValue}>
      {children}
    </ColumnsContext.Provider>
  );
}

export function calcItemWidth(params: ColumnsStateElement): number {
  const { fullWidth, columns } = params;
  const margin = 16;
  const itemWidth: number = (fullWidth - 32 - (columns + 1) * margin) / columns;
  return itemWidth;
}
