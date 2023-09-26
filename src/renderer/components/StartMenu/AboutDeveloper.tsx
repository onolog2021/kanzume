import { Box } from '@mui/material';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import { ReactComponent as XIcon } from '../../../../assets/x.svg';

export default function AboutDeveloper() {
  const openX = () => {
    window.electron.ipcRenderer.sendMessage('openURL', 'https://twitter.com/onolog2021')
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
      <p style={{fontSize: 12}}>開発者/問い合わせ</p>
      <PlaneIconButton onClick={openX}>
        <XIcon width={16}/>
      </PlaneIconButton>
    </Box>
  );
}
