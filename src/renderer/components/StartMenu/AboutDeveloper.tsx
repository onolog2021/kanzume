import { Box, Typography } from '@mui/material';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import { ReactComponent as XIcon } from '../../../../assets/x.svg';
import { ReactComponent as NoteIcont } from '../../../../assets/note.svg';
import { ReactComponent as MailIcon } from '../../../../assets/mail.svg';

export default function AboutDeveloper({ version }) {
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
    );
  };

  const openGoogleForm = () => {
    window.electron.ipcRenderer.sendMessage(
      'openURL',
      'https://docs.google.com/forms/d/e/1FAIpQLSdoywQ8sGJXCOz9Cqg3WGfJFWZSVB4XEkhWhCOIHI_2I_4t0g/viewform'
    );
  };

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
      <Typography sx={{ fontSize: 12, mr: 4 }}>ver.{version}</Typography>
      <Typography sx={{ fontSize: 12 }}>開発者</Typography>
      <PlaneIconButton onClick={openX}>
        <XIcon width={16} />
      </PlaneIconButton>
      <Typography sx={{ fontSize: 12, ml: 4 }}>不具合報告・要望</Typography>
      <PlaneIconButton onClick={openGoogleForm}>
        <MailIcon width={16} />
      </PlaneIconButton>
      <Typography sx={{ fontSize: 12, ml: 4 }}>操作方法など</Typography>
      <PlaneIconButton onClick={openNote}>
        <NoteIcont width={40} />
      </PlaneIconButton>
    </Box>
  );
}
