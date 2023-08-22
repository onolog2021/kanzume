import { useEffect, useRef, useState } from 'react';
import {
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';

function CurrentProjects(props) {
  const { handleClick } = props;
  const [projectlist, setProjectList] = useState<unknown[]>([]);

  useEffect(() => {
    const queryJson = {
      table: 'project',
      order: ['created_at', 'DESC'],
      limit: 5,
    };

    window.electron.ipcRenderer
      .invoke('fetchRecords', queryJson)
      .then((result) => {
        setProjectList(result);
      })
      .catch((error) => console.warn(error));
  }, []);

  const openProject = (id: number) => {};

  return (
    <div>
      <h2>最近開いたプロジェクト</h2>
      <List>
        {projectlist.map((project) => (
          <ListItemButton
            key={project.id}
            onClick={() => handleClick(project.id)}
          >
            <ListItemText primary={project.title} secondary={project.created_at}/>
          </ListItemButton>
        ))}
      </List>
    </div>
  );
}

export default CurrentProjects;
