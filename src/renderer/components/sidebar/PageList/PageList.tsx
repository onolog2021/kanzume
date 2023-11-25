import React, { useContext, useState } from 'react';
import { List, Box, IconButton, Tooltip } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import Folder from 'renderer/Classes/Folder';
import NowLoading from 'renderer/GlobalComponent/NowLoading';
import {
  ProjectContext,
  CurrentPageContext,
  TabListContext,
  SidebarSelectedContext,
  CreateFormSelectorContext,
  CreateFormSelectorElement,
} from '../../Context';
import TreeBranch from './TreeBranch';
import CreateForm from './CreateForm';
import { ReactComponent as PageIcon } from '../../../../../assets/paper.svg';
import CategoryTitle from '../CategoryTitle';
import { ReactComponent as AddPageButton } from '../../../../../assets/paper-plus.svg';
import { ReactComponent as AddFolderButton } from '../../../../../assets/folder-plus.svg';
import Node from '../../../Classes/Node';

type FormStatus = 'page' | 'folder' | null;

function PageList({ root }: { root: Node }) {
  const [project] = useContext(ProjectContext);
  const { selectedSidebarItem } = useContext(SidebarSelectedContext);
  const { setCreateFormSelector } = useContext(CreateFormSelectorContext);
  const { setCurrentPage } = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [newForm, setNewForm] = useState<FormStatus>(null);
  const svg = <PageIcon style={{ fill: '#999' }} />;

  const { setNodeRef, isOver } = useDroppable({
    id: 'page-list',
    data: { area: 'pageList', type: 'area' },
  });

  const switchNewForm = (status: 'page' | 'folder') => {
    let currentParentId: number | null = null;
    if (selectedSidebarItem) {
      // ページの場合
      if (selectedSidebarItem.type === 'page') {
        currentParentId = selectedSidebarItem.parentId
          ? selectedSidebarItem.parentId
          : null;
      }
      // フォルダの場合
      if (selectedSidebarItem.type === 'folder') {
        currentParentId = selectedSidebarItem.id;
      }
    }

    // setNewForm(status);
    const value: CreateFormSelectorElement = {
      type: status,
      parentId: currentParentId,
    };
    setCreateFormSelector(value);
  };

  if (!root) {
    return <NowLoading loading />;
  }

  return (
    <>
      <div className="sideBarSectionName">
        <CategoryTitle svg={svg} categoryName="テキスト" />
        <Tooltip title="テキスト作成" placement="top">
          <IconButton onClick={() => switchNewForm('page')}>
            <AddPageButton style={{ width: 16, height: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="フォルダ作成" placement="top">
          <IconButton onClick={() => switchNewForm('folder')}>
            <AddFolderButton style={{ width: 16, height: 16 }} />
          </IconButton>
        </Tooltip>
      </div>

      <List
        ref={setNodeRef}
        sx={{
          py: 1,
          transition: 'background-color 1s ease',
          minHeight: 120,
          background: isOver ? '#F2FDFF' : 'none',
        }}
      >
        {root && <TreeBranch parentNode={root} />}
      </List>
    </>
  );
}

export default PageList;
