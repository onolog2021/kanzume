import React, { useContext, useEffect, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import NowLoading from 'renderer/GlobalComponent/NowLoading';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import { useTheme } from '@mui/material/styles';
import BookmarkButton from './BookmarkButton';
import { ReactComponent as HistoryIcon } from '../../../../../assets/history.svg';
import { ReactComponent as MarkerIcon } from '../../../../../assets/marker.svg';
import { ReactComponent as PreviewIcon } from '../../../../../assets/preview.svg';
import { PageElement } from '../../../../types/sqlElement';
import { TabListElement } from '../../../../types/renderElement';
import {
  CurrentPageContext,
  CurrentPageElement,
  TabListContext,
} from '../../Context';

export default function EditorTools({
  page,
  textSetting,
}: {
  page: PageElement;
  textSetting: any;
}) {
  const [loading, setLoading] = useState(false);
  const [hasGit, setHasGit] = useState(false);
  const { tabList, addTab } = useContext(TabListContext);
  const { setCurrentPage } = useContext(CurrentPageContext);
  const theme = useTheme();

  useEffect(() => {
    async function checkGit() {
      const result = await window.electron.ipcRenderer.invoke('hasGit?');
      setHasGit(result);
    }

    checkGit();
  }, []);

  const commitPage = async () => {
    setLoading(true);
    await window.electron.ipcRenderer.invoke('commitPage', page.id);
    setLoading(false);
  };

  const togglePageStatus = () => {
    const historyTab: TabListElement = {
      id: page.id,
      title: `${page.title}【履歴】`,
      type: 'history',
      tabId: `history-${page.id}`,
    };
    addTab(historyTab);
    const pageData: CurrentPageElement = {
      id: page.id,
      type: 'history',
      parentId: null,
    };
    setCurrentPage(pageData);
  };

  const LoadingComponent = <NowLoading loading={loading} />;

  const GitComponents = hasGit ? (
    <>
      <Tooltip title="タイムマーカーを作成" placement="left">
        <PlaneIconButton onClick={commitPage}>
          <MarkerIcon />
        </PlaneIconButton>
      </Tooltip>

      <Tooltip title="タイムライン表示" placement="left">
        <PlaneIconButton onClick={togglePageStatus}>
          <HistoryIcon />
        </PlaneIconButton>
      </Tooltip>
    </>
  ) : null;

  function displayPreview() {
    const tabData: TabListElement = {
      title: `${page.title}【 プレビュー 】`,
      id: page.id,
      type: 'preview',
      tabId: `tab-preview-${page.id}`,
    };
    if (
      tabList.length === 0 ||
      !tabList.some((item) => item.tabId === tabData.tabId)
    ) {
      addTab(tabData);
    }
    const currentQuery: CurrentPageElement = {
      id: page.id,
      type: 'preview',
      parentId: null,
    };
    setCurrentPage(currentQuery);
  }

  return (
    <Box
      className="editorTools"
      sx={{
        svg: {
          fill: theme.palette.mode === 'dark' ? '#dddd' : '#777',
        },
      }}
    >
      <Tooltip title="クイックアクセス登録" placement="left">
        <PlaneIconButton>
          <BookmarkButton page={page} />
        </PlaneIconButton>
      </Tooltip>
      {textSetting}
      <Tooltip title="プレビュー表示" placement="left">
        <PlaneIconButton onClick={() => displayPreview()}>
          <PreviewIcon />
        </PlaneIconButton>
      </Tooltip>
      {loading ? LoadingComponent : GitComponents}
    </Box>
  );
}
