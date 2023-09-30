import { Box, Typography } from '@mui/material';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import { ReactComponent as XIcon } from '../../../../assets/x.svg';
import { ReactComponent as NoteIcont } from '../../../../assets/note.svg';

export default function AboutDeveloper() {
  const openX = () => {
    window.electron.ipcRenderer.sendMessage(
      'openURL',
      'https://twitter.com/onolog2021'
    );
  };

  const openNote = () => {
    window.electron.ipcRenderer.sendMessage(
      'openURL',
      'https://note.com/onolog_review'
    )
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        bottom: 16,
        right: 16,
      }}
    >
      <Typography sx={{ fontSize: 12 }}>開発者/問い合わせ</Typography>
      <PlaneIconButton onClick={openX}>
        <XIcon width={16} />
      </PlaneIconButton>
      <Typography sx={{ fontSize: 12, ml: 4 }}>操作方法など</Typography>
      <PlaneIconButton onClick={openNote}>
        <NoteIcont width={40} />
      </PlaneIconButton>
    </Box>
  );
}
