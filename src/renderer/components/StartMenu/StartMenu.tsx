import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import CurrentProjects from './CurrentProject';
import CreateProjectForm from './CreateProjectForm';
import LogoImage from '../../../../assets/logo.png';
import SearchProjectForm from './SearchProjectForm';

function StartMenu() {
  const navigate = useNavigate();

  const openProject = (id: number) => {
    navigate('/editor', { state: { project_id: id } });
  };

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
    </Box>
  );
}

export default StartMenu;
