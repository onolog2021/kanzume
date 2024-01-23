import React, { useState, useContext, useEffect } from 'react';
import { Drawer, Box, Typography, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import NowLoading from 'renderer/GlobalComponent/NowLoading';
import { useTheme } from '@emotion/react';
import {
  CreateFormSelectorProvider,
  ProjectContext,
  SelectedSidebarProvider,
} from '../Context';
import OpenTrashBoxButton from './TrashBox/OpenTrashBoxButton';
import LogoImage from '../../../../assets/logo.png';
import { ReactComponent as SettingIcon } from '../../../../assets/gear.svg';
import { ReactComponent as HomeIcon } from '../../../../assets/home.svg';
import ProjectSettingWindow from './ProjectSettingWindow';

function SideBar({ project_id, pageList, boardList, quickAccessArea }) {
  const { project } = useContext(ProjectContext);
  const [projectTitle, setProjectTitle] = useState();
  const [openSetting, setOpenSetting] = useState<Boolean>(false);
  const navigate = useNavigate();
  const theme = useTheme();

  async function returnHome() {
    await window.electron.ipcRenderer.invoke('storeRemove', 'project');
    await window.electron.ipcRenderer.invoke('storeRemove', 'currentPage');
    await window.electron.ipcRenderer.invoke('storeRemove', 'tabList');
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
    <SelectedSidebarProvider>
      <Drawer
        anchor="left"
        open
        variant="permanent"
        sx={{
          width: 240,
          position: 'relative',
          '& .MuiDrawer-paper': {
            width: 240,
            px: 1,
          },
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
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="スタートメニュー" placement="bottom">
              <PlaneIconButton onClick={() => returnHome()} sx={{ p: 0 }}>
                <HomeIcon width={18} fill={theme.palette.primary.main} />
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
              returnHomeFunc={() => returnHome()}
            />
          )}

          {quickAccessArea}
          <CreateFormSelectorProvider>{pageList}</CreateFormSelectorProvider>
          {boardList}
        </Box>
        <OpenTrashBoxButton />
      </Drawer>
    </SelectedSidebarProvider>
  );
}

export default SideBar;
