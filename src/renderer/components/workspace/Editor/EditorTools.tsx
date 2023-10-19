import { useEffect, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import NowLoading from 'renderer/GlobalComponent/NowLoading';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import { useTheme } from '@mui/material/styles';
import BookmarkButton from './BookmarkButton';
import TextSetting from './TextSetting';
import { ReactComponent as HistoryIcon } from '../../../../../assets/history.svg';
import { ReactComponent as MarkerIcon } from '../../../../../assets/marker.svg';

export default function EditorTools({ page, toggleStatus, textSetting }) {
  const [loading, setLoading] = useState(false);
  const [hasGit, setHasGit] = useState(false);
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
    toggleStatus('history');
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
      {loading ? LoadingComponent : GitComponents}
    </Box>
  );
}
