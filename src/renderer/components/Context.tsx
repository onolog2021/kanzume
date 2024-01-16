// src/contexts/CountContexts.jsx

import React, {
  useState,
  createContext,
  useCallback,
  useMemo,
  ReactNode,
  useEffect,
} from 'react';
import { TabListElement } from '../../types/renderElement';

export const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);

  useEffect(() => {
    async function fetchStoreProject() {
      try {
        const storedProject = await window.electron.ipcRenderer.invoke(
          'storeGet',
          'project'
        );
        if (storedProject) {
          setProject(project);
        }
      } catch (error) {
        console.error('Failed to fetch stored project:', error);
      }
    }

    fetchStoreProject();
  }, []);

  useEffect(() => {
    function setProjectId() {
      const query = { key: 'project', value: project };
      window.electron.ipcRenderer.sendMessage('storeSet', query);
    }

    if (project) {
      setProjectId();
    }
  }, [project]);

  return (
    <ProjectContext.Provider value={[project, setProject]}>
      {children}
    </ProjectContext.Provider>
  );
}

// 現在のページ
export type CurrentPageElement = {
  id: number;
  type: 'board' | 'editor' | 'trash' | 'preview' | null;
  parentId: number | null;
};

const exPage = await window.electron.ipcRenderer.invoke(
  'storeGet',
  'currentPage'
);
const initialCurrentPage: CurrentPageElement = exPage || {
  id: 0,
  type: null,
  parentId: null,
};

export const CurrentPageContext = createContext<{
  currentPage: CurrentPageElement;
  setCurrentPage: React.Dispatch<React.SetStateAction<CurrentPageElement>>;
}>({
  currentPage: initialCurrentPage,
  setCurrentPage: () => {},
});

export function CurrentPageProvider({ children }) {
  const [currentPage, setCurrentPage] =
    useState<CurrentPageElement>(initialCurrentPage);

  useEffect(() => {
    function setStoreCurrentPage() {
      const query = { key: 'currentPage', value: currentPage };
      window.electron.ipcRenderer.sendMessage('storeSet', query);
    }

    if (currentPage) {
      setStoreCurrentPage();
    }
  }, [currentPage]);

  const contextValue = useMemo(
    () => ({
      currentPage,
      setCurrentPage,
    }),
    [currentPage, setCurrentPage]
  );

  return (
    <CurrentPageContext.Provider value={contextValue}>
      {children}
    </CurrentPageContext.Provider>
  );
}

// タブリスト
export const TabListContext = createContext([]);
export function TabListProvider({ children }) {
  const [tabList, setTabList] = useState<TabListElement[]>([]);

  useEffect(() => {
    async function fetchStoredTabList() {
      try {
        const storedTabList = await window.electron.ipcRenderer.invoke(
          'storeGet',
          'tabList'
        );
        if (storedTabList) {
          setTabList(storedTabList);
        }
      } catch (error) {
        console.error('Failed to fetch stored tabList:', error);
      }
    }

    fetchStoredTabList();
  }, []);

  useEffect(() => {
    function storeTabList() {
      const query = { key: 'tabList', value: tabList };
      window.electron.ipcRenderer.sendMessage('storeSet', query);
    }

    if (tabList) {
      storeTabList();
    }
  }, [tabList]);

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

// サイドバーの選択アイテム用
export type SelectedItemElement = {
  type: 'board' | 'folder' | 'page';
  id: number;
  parentId: number | null;
};

const initialSelectedItem: SelectedItemElement = {
  type: 'page',
  id: 0,
  parentId: null,
};

export const SidebarSelectedContext = createContext<{
  selectedSidebarItem: SelectedItemElement | undefined;
  setSelectedSidebarItem: React.Dispatch<
    React.SetStateAction<SelectedItemElement>
  >;
}>({
  selectedSidebarItem: initialSelectedItem,
  setSelectedSidebarItem: () => {},
});

export function SelectedSidebarProvider({ children }: { children: ReactNode }) {
  const [selectedSidebarItem, setSelectedSidebarItem] =
    useState<SelectedItemElement>(initialSelectedItem);

  const contextValue = useMemo(
    () => ({
      selectedSidebarItem,
      setSelectedSidebarItem,
    }),
    [selectedSidebarItem, setSelectedSidebarItem]
  );

  return (
    <SidebarSelectedContext.Provider value={contextValue}>
      {children}
    </SidebarSelectedContext.Provider>
  );
}

// サイドバーのクリエイト用
export type CreateFormSelectorElement = {
  type: 'folder' | 'page';
  parentId: number | null;
};

export const CreateFormSelectorContext = createContext<{
  createFormSelector: CreateFormSelectorElement | undefined;
  setCreateFormSelector: React.Dispatch<
    React.SetStateAction<CreateFormSelectorElement | undefined>
  >;
}>({
  createFormSelector: undefined,
  setCreateFormSelector: () => {},
});

export function CreateFormSelectorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [createFormSelector, setCreateFormSelector] = useState<
    CreateFormSelectorElement | undefined
  >(undefined);

  const contextValue = useMemo(
    () => ({
      createFormSelector,
      setCreateFormSelector,
    }),
    [createFormSelector, setCreateFormSelector]
  );

  return (
    <CreateFormSelectorContext.Provider value={contextValue}>
      {children}
    </CreateFormSelectorContext.Provider>
  );
}
