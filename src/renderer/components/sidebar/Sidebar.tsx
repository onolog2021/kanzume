import React, { useState, useContext, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import NowLoading from 'renderer/GlobalComponent/NowLoading';
import { ProjectContext } from '../Context';
import OpenTrashBoxButton from './TrashBox/OpenTrashBoxButton';
import LogoImage from '../../../../assets/logo.png';
import { ReactComponent as SettingIcon } from '../../../../assets/gear.svg';
import ProjectSettingWindow from './ProjectSettingWindow';

function SideBar({ project_id, pageList, boardList, quickAccessArea }) {
  const [project, setProject] = useContext(ProjectContext);
  const [projectTitle, setProjectTitle] = useState();
  const [openSetting, setOpenSetting] = useState<Boolean>(false);
  const navigate = useNavigate();

  function returnHome() {
    navigate('/');
  }

  const toggleSetting = (boolean: Boolean) => {
    setOpenSetting(boolean);
  };

  const changeTitlte = (title: string) => {
    setProjectTitle(title);
  };

  useEffect(() => {
    if (project) {
      setProjectTitle(project.title);
    }
  }, [project]);

  if (!project) {
    return <NowLoading loading />;
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
            <PlaneIconButton onClick={() => returnHome()} sx={{ p: 0 }}>
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
            {projectTitle}
          </Typography>
          <PlaneIconButton
            sx={{ ml: 'auto' }}
            onClick={() => toggleSetting(true)}
          >
            <SettingIcon width={16} fill="gray" />
          </PlaneIconButton>
        </Box>
        {openSetting && (
          <ProjectSettingWindow
            closdeWindow={() => toggleSetting(false)}
            title={projectTitle}
            changeTitlte={changeTitlte}
            project={project}
          />
        )}

        {quickAccessArea}
        {pageList}
        {boardList}
      </Box>
      <OpenTrashBoxButton />
    </Drawer>
  );
}

export default SideBar;
