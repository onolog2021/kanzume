import { Box, IconButton } from '@mui/material';
import BookmarkButton from './BookmarkButton';
import TextSetting from './TextSetting';
import { ReactComponent as HistoryIcon } from '../../../../../assets/history.svg';
import { ReactComponent as MarkerIcon } from '../../../../../assets/marker.svg';

export default function EditorTools({ page, toggleStatus }) {
  const changeFontStyle = (font: string) => {
    setFontStyle(font);
  };

  const commitPage = async () => {
    // await editor.save();
    await window.electron.ipcRenderer.invoke('commitPage', page.id);
  };

  function togglePageStatus() {
    toggleStatus('history');
  }

  return (
    <Box className="editorTools">
      <BookmarkButton page={page} />
      <TextSetting changeFontFunc={changeFontStyle} />
      <IconButton onClick={commitPage}>
        <MarkerIcon />
      </IconButton>
      <IconButton onClick={() => togglePageStatus()}>
        <HistoryIcon />
      </IconButton>
    </Box>
  );
}
