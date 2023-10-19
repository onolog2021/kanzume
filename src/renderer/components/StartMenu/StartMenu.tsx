import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  ListItemButton,
  Snackbar,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import CurrentProjects from './CurrentProject';
import CreateProjectForm from './CreateProjectForm';
import LogoImage from '../../../../assets/logo.png';
import SearchProjectForm from './SearchProjectForm';
import AboutDeveloper from './AboutDeveloper';
import { ReactComponent as ModeIdon } from '../../../../assets/brightness.svg';

function StartMenu() {
  const [snackOpen, setSnackOpen] = useState<boolean | undefined>(false);
  const navigate = useNavigate();
  const [mode, setMode] = useState<'dark' | 'light'>('light');

  const openProject = (id: number) => {
    navigate('/editor', { state: { project_id: id } });
  };

  useEffect(() => {
    async function checkGit(): Promise<void> {
      const result = await window.electron.ipcRenderer.invoke('hasGit?');
      setSnackOpen(!result);
    }

    checkGit();

    async function fetchMode() {
      const initialMode = await window.electron.ipcRenderer.invoke(
        'storeGet',
        'mode'
      );
      if (initialMode) {
        setMode(initialMode);
      } else {
        setMode('light');
        window.electron.ipcRenderer.sendMessage('storeSet', {
          key: 'mode',
          value: 'light',
        });
      }
    }

    fetchMode();
  }, []);

  const message =
    'Gitと連携できませんでした。\nKanzumeの一部機能は制限されています。';

  const toGit = () => {
    window.electron.ipcRenderer.sendMessage(
      'openURL',
      'https://git-scm.com/downloads'
    );
  };

  const action = (
    <Button onClick={toGit} sx={{ ':hover': { background: 'white' } }}>
      Gitをダウンロード
    </Button>
  );

  const aboutGit = (
    <Snackbar
      open={snackOpen}
      autoHideDuration={7000}
      onClose={() => {
        setSnackOpen(false);
      }}
      sx={{ whiteSpace: 'pre-wrap', letterSpacing: 0.5 }}
      message={message}
      action={action}
    />
  );

  const switchMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    window.electron.ipcRenderer.sendMessage('switchMode', newMode);
    setMode(newMode);
  };

  return (
    <Box className="startMenuWrapper">
      <ListItemButton
        sx={{
          position: 'absolute',
          top: 24,
          left: 16,
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={switchMode}
      >
        <Typography
          sx={{
            fontSize: 12,
            mr: 1,
          }}
        >
          {mode === 'dark' ? 'ダークモード' : 'ライトモード'}
        </Typography>
        <ModeIdon style={{ width: 16, height: 16 }} />
      </ListItemButton>
      <img src={LogoImage} alt="logo" className="logo" />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat( 2, 1fr )',
          gap: 10,
          width: '50%',
          mx: 'auto',
          '@media (max-width: 960px)': {
            width: '80%',
          },
        }}
      >
        <CurrentProjects handleClick={openProject} />
        <Box>
          <CreateProjectForm handleClick={openProject} />
          <SearchProjectForm handleClick={openProject} />
        </Box>
      </Box>
      <AboutDeveloper />
      {aboutGit}
    </Box>
  );
}

export default StartMenu;
