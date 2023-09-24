import { useState, useContext } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Tooltip,
  useTheme,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProjectContext } from '../Context';
import OpenTrashBoxButton from './TrashBox/OpenTrashBoxButton';
import { ReactComponent as HomeIcon } from '../../../../assets/home.svg';
import LogoImage from '../../../../assets/logo.png';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';

function SideBar({ project_id, pageList, boardList, quickAccessArea }) {
  const [project, setProject] = useContext(ProjectContext);
  const [isHidden, setIsHidden] = useState<Boolean>(false);
  const navigate = useNavigate();
  const theme = useTheme();

  function returnHome() {
    navigate('/');
  }

  if (!project) {
    return <h1>loading...</h1>;
  }

  return (
    <Drawer
      anchor="left"
      open
      variant="permanent"
      sx={{
        width: 240,
        position: 'relative',
        '& .MuiDrawer-paper': { width: 240, px: 1, minHeight: '100vh' },
        '& ::-webkit-scrollbar': {
          width: '2px',
        },
        '& ::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent',
        },
        '& :hover::-webkit-scrollbar-thumb': {
          backgroundColor: '#999',
        },
      }}
    >
      <Box sx={{ mb: '40px' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="スタートメニュー" placement="bottom">
            <PlaneIconButton onClick={() => returnHome()} sx={{p: 0}}>
              <img
                src={LogoImage}
                alt="logo"
                className="logo"
                style={{
                  margin: '0 auto',
                  display: 'block',
                  width: 24,
                }}
              />
            </PlaneIconButton>
            {/* <HomeIcon
              width={24}
              onClick={() => returnHome()}
              style={{ cursor: 'pointer', fill: theme.palette.primary.main }}
            /> */}
          </Tooltip>
          <Typography
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: 13,
              height: 18,
              lineHeight: '18px',
              my: 2,
            }}
          >
            {project.title}
          </Typography>
        </Box>

        {quickAccessArea}
        {pageList}
        {boardList}
      </Box>
      <OpenTrashBoxButton />
    </Drawer>
  );
}

export default SideBar;
