import { useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import ReactLoading from 'react-loading';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import BookmarkButton from './BookmarkButton';
import TextSetting from './TextSetting';
import { ReactComponent as HistoryIcon } from '../../../../../assets/history.svg';
import { ReactComponent as MarkerIcon } from '../../../../../assets/marker.svg';

export default function EditorTools({
  page,
  toggleStatus,
  changeFontSize,
  changeFontFamily,
}) {
  const [loading, setLoading] = useState(false);

  const changeFontStyle = (font: string) => {
    setFontStyle(font);
  };

  const commitPage = async () => {
    setLoading(true);
    await window.electron.ipcRenderer.invoke('commitPage', page.id);
    setLoading(false);
  };

  function togglePageStatus() {
    toggleStatus('history');
  }

  return (
    <Box className="editorTools">
      <Tooltip title="クイックアクセス登録" placement="left">
        <PlaneIconButton>
          <BookmarkButton page={page} />
        </PlaneIconButton>
      </Tooltip>
      <Tooltip title="テキスト設定" placement="left">
        <PlaneIconButton>
          <TextSetting
            changeFontFamily={changeFontFamily}
            changeFontSize={changeFontSize}
          />
        </PlaneIconButton>
      </Tooltip>
      {loading && loading ? (
        <ReactLoading type="spin" color="gray" width={24} height={24} />
      ) : (
        <Tooltip title="タイムマーカーを追加" placement="left">
          <PlaneIconButton onClick={commitPage}>
            <MarkerIcon />
          </PlaneIconButton>
        </Tooltip>
      )}
      <Tooltip title="タイムライン表示" placement="left">
        <PlaneIconButton onClick={() => togglePageStatus()}>
          <HistoryIcon />
        </PlaneIconButton>
      </Tooltip>
    </Box>
  );
}
