import { useEffect, useRef, useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import CurrentProjects from './CurrentProject';
import { ReactComponent as Logo } from '../../../../assets/logo.svg';
import { useNavigate } from 'react-router-dom';

function StartMenu() {
  const projectTitleRef = useRef();
  const navigate = useNavigate();

  const openProject = (id: number) => {
    navigate('/editor', { state: { project_id: id } });
  }

  function createNewPage() {
    const projectTitle = projectTitleRef.current.value;
    window.electron.ipcRenderer
      .invoke('createProject', projectTitle)
      .then((result) => {
        openProject(result);
      });
  }

  return (
    <div className='startMenuWrapper'>
      <Logo className='logo'/>
      <div className="startMenu">
        <CurrentProjects handleClick={openProject} />
        <div>
          <TextField
            fullWidth
            label="プロジェクト名"
            inputRef={projectTitleRef}
          />
          <Button size="large" variant="contained" onClick={createNewPage}>
            新規作成
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StartMenu;
