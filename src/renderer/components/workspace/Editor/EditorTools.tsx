import { Box, IconButton } from '@mui/material';
import BookmarkButton from './BookmarkButton';
import TextSetting from './TextSetting';
import { ReactComponent as HistoryIcon } from '../../../../../assets/history.svg';
import { ReactComponent as MarkerIcon } from '../../../../../assets/marker.svg';

export default function EditorTools({ page }) {
  const changeFontStyle = (font: string) => {
    setFontStyle(font);
  };

  const commitPage = async () => {
    // await editor.save();
    await window.electron.ipcRenderer.invoke('commitPage', page.id);
  };

  function togglePageStatus(param) {
    alert('change!');
  }

  return (
    <Box className="editorTools">
      <BookmarkButton page={page} />
      <TextSetting changeFontFunc={changeFontStyle} />
      {/* <Button onClick={commitPage}>JSON出力</Button> */}
      <IconButton>
        <MarkerIcon />
      </IconButton>
      <IconButton onClick={() => togglePageStatus('history')}>
        <HistoryIcon />
      </IconButton>
    </Box>
  );
}
