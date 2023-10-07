import { useNavigate } from 'react-router-dom';
import { Box, Button, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import CurrentProjects from './CurrentProject';
import CreateProjectForm from './CreateProjectForm';
import LogoImage from '../../../../assets/logo.png';
import SearchProjectForm from './SearchProjectForm';
import AboutDeveloper from './AboutDeveloper';

function StartMenu() {
  const [snackOpen, setSnackOpen] = useState<boolean | undefined>(false);
  const navigate = useNavigate();

  const openProject = (id: number) => {
    navigate('/editor', { state: { project_id: id } });
  };

  useEffect(() => {
    async function checkGit(): Promise<void> {
      const result = await window.electron.ipcRenderer.invoke('hasGit?');
      setSnackOpen(!result);
    }

    checkGit();
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

  return (
    <Box className="startMenuWrapper">
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
