import { useEffect, useRef, useState } from 'react';
import {
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ProjectItem from './ProjectItem';

function CurrentProjects({ handleClick }) {
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

  return (
    <div>
      <h2>最近のプロジェクト</h2>
      <List>
        {projectlist.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            handleClick={handleClick}
          />
        ))}
      </List>
    </div>
  );
}

export default CurrentProjects;
