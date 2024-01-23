import React, { useContext, useEffect, useState } from 'react';
import { SortableContext } from '@dnd-kit/sortable';
import Node from 'renderer/Classes/Node';
import NowLoading from 'renderer/GlobalComponent/NowLoading';
import ListItemFolder from './ListItemFoder';
import ListItemPage from './ListItemPage';
import {
  CreateFormSelectorContext,
  CurrentPageContext,
  ProjectContext,
  SidebarSelectedContext,
  TabListContext,
} from '../../Context';
import CreateForm from './CreateForm';
import { InsertRecordQuery } from '../../../../types/renderElement';
import Folder from '../../../Classes/Folder';

export default function TreeBranch({ parentNode }: { parentNode: Node }) {
  const { createFormSelector, setCreateFormSelector } = useContext(
    CreateFormSelectorContext
  );
  const { children } = parentNode;
  const { project } = useContext(ProjectContext);
  const { selectedSidebarItem } = useContext(SidebarSelectedContext);
  const { addTab } = useContext(TabListContext);
  const { setCurrentPage } = useContext(CurrentPageContext);
  const [items, setItems] = useState([]);
  const [parentId, setParentId] = useState<number | null>(null);
  const [isForm, setIsForm] = useState<boolean>(false);

  useEffect(() => {
    if (parentNode.type === 'folder') {
      setParentId(parentNode.id);
    }
  }, [parentNode]);

  useEffect(() => {
    if (children) {
      setItems(parentNode.createOrderArrayForDndTag());
    }
  }, [children, parentNode]);

  useEffect(() => {
    if (createFormSelector) {
      const isMatch = createFormSelector.parentId === parentId;
      setIsForm(isMatch);

      if (createFormSelector.parentId === null && parentNode.parent === null) {
        setIsForm(true);
      }
    }
  }, [createFormSelector]);

  const createNewPage = async (title: string) => {
    const pageArgs = {
      table: 'page',
      columns: {
        title,
        project_id: project.id,
        position: -1,
      },
    };
    const newId = await window.electron.ipcRenderer.invoke(
      'insertRecord',
      pageArgs
    );

    // 選択されているフォルダがあった場合
    if (selectedSidebarItem) {
      if (
        selectedSidebarItem.parentId ||
        selectedSidebarItem.type === 'folder'
      ) {
        const storeQuery: InsertRecordQuery<'store'> = {
          table: 'store',
          columns: {
            page_id: newId,
            position: -1,
            folder_id:
              selectedSidebarItem.type === 'folder'
                ? selectedSidebarItem.id
                : selectedSidebarItem?.parentId,
          },
        };
        await window.electron.ipcRenderer.invoke('insertRecord', storeQuery);
      }
    }

    window.electron.ipcRenderer.sendMessage('updatePageList', project.id);
    const newTab = {
      id: newId,
      title,
      type: 'editor',
      tabId: `tab-editor-${newId}`,
    };
    addTab(newTab);
    setCurrentPage({ id: newId, type: 'editor' });
  };

  const createNewFolder = async (title: string) => {
    const hasParent = selectedSidebarItem?.parentId;
    const query: InsertRecordQuery<'folder'> = {
      table: 'folder',
      columns: {
        title,
        type: 'folder',
        position: -1,
        project_id: project.id,
      },
    };

    if (hasParent && query && query.columns) {
      query.columns.parent_id = createFormSelector?.parentId;
    }

    await window.electron.ipcRenderer.invoke('insertRecord', query);

    window.electron.ipcRenderer.sendMessage('updatePageList', project.id);
  };

  const switchNewForm = (status: boolean) => {
    setIsForm(status);
    setCreateFormSelector(undefined);
  };

  const FolderForm = (
    <CreateForm
      createFunc={createNewFolder}
      setStatus={switchNewForm}
      label="フォルダタイトル"
    />
  );

  const PageForm = (
    <CreateForm
      createFunc={createNewPage}
      setStatus={switchNewForm}
      label="ページタイトル"
    />
  );

  function newFormDisplay(type: 'page' | 'folder') {
    return type === 'folder' ? FolderForm : PageForm;
  }

  if (!parentNode) {
    return <NowLoading loading />;
  }

  return (
    <div className={`folder-${parentId}`}>
      {isForm && newFormDisplay(createFormSelector?.type)}
      <SortableContext items={items}>
        {children &&
          children.map((item, index) =>
            item.type === 'folder' ? (
              <ListItemFolder
                key={index}
                folderData={item}
                orderArray={items}
                parentId={parentId}
              />
            ) : (
              <ListItemPage
                key={index}
                pageData={item}
                orderArray={items}
                parentId={parentId}
                bookmark={false}
              />
            )
          )}
      </SortableContext>
    </div>
  );
}
