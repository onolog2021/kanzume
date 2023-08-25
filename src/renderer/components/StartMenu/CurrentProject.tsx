import { useEffect, useRef, useState } from 'react';
import {
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ProjectItem from './ProjectItem';
import TextWithSvg from './TextWithSVG';
import { ReactComponent as DocumentsSvg } from '../../../../assets/documents.svg';

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
      <TextWithSvg SvgComponent={DocumentsSvg} text="最近のプロジェクト" />
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
