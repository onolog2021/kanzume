import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';

function Start() {
  const projectTitleRef = useRef();
  const [projectlist, setProjectList] = useState<unknown[]>([]);
  const navigate = useNavigate();

  function createNewPage() {
    const projectTitle = projectTitleRef.current.value;
    window.electron.ipcRenderer
      .invoke('createProject', projectTitle)
      .then((result) => {
        handleClick(result);
      });
  }

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke('getTableData', ['project'])
      .then((result) => {
        setProjectList(result);
      });
  }, []);

  const handleClick = (id: number) => {
    navigate('/editor', { state: { project_id: id } });
  };

  return (
    <>
      <h1>Start!</h1>
      <TextField fullWidth label="プロジェクト名" inputRef={projectTitleRef} />
      <Button size="large" variant="contained" onClick={createNewPage}>
        新規作成
      </Button>
      <hr />
      <h2>既存ファイル</h2>
      <List>
        {projectlist.map((project) => (
          <ListItem
            key={project.id}
            button
            onClick={() => handleClick(project.id)}
          >
            <ListItemText primary={project.title} />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default Start;
