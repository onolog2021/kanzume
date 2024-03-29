import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  ListItemButton,
  Snackbar,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CurrentProjects from './CurrentProject';
import CreateProjectForm from './CreateProjectForm';
import LogoImage from '../../../../assets/logo.png';
import SearchProjectForm from './SearchProjectForm';
import AboutDeveloper from './AboutDeveloper';
import { ReactComponent as ModeIdon } from '../../../../assets/brightness.svg';

function StartMenu() {
  const [snackOpen, setSnackOpen] = useState<boolean | undefined>(false);
  const [version, setVersion] = useState();
  const navigate = useNavigate();
  const theme = useTheme();

  const openProject = (id: number) => {
    navigate('/editor', { state: { project_id: id } });
  };
  useEffect(() => {
    async function storedId() {
      const project = await window.electron.ipcRenderer.invoke(
        'storeGet',
        'project'
      );

      if (project) {
        navigate('/editor', { state: { project_id: project.id } });
      }
    }

    storedId();

    async function checkGit(): Promise<void> {
      const result = await window.electron.ipcRenderer.invoke('hasGit?');
      setSnackOpen(!result);
    }

    checkGit();

    async function getVersion() {
      const currentVersion = await window.electron.ipcRenderer.invoke(
        'storeGet',
        'version'
      );
      setVersion(currentVersion);
    }

    getVersion();
  }, []);

  const message =
    'Gitと連携できませんでした。\nKanzumeの一部機能は制限されています。';

  const toGit = () => {
    window.electron.ipcRenderer.sendMessage(
      'openURL',
      'https://note.com/onolog_review/n/ne20e938d8a3b'
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
    const newMode = theme.palette.mode === 'dark' ? 'light' : 'dark';
    window.electron.ipcRenderer.sendMessage('switchMode', newMode);
  };

  return (
    <Box className="startMenuWrapper" sx={{ minHeight: '100vh' }}>
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
          {theme.palette.mode === 'dark' ? 'ダーク' : 'ライト'}
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
      <AboutDeveloper version={version} />
      {aboutGit}
    </Box>
  );
}

export default StartMenu;
