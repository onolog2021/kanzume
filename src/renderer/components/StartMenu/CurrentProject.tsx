import { useEffect, useRef, useState } from 'react';
import { List } from '@mui/material';
import ReactLoading from 'react-loading';
import ProjectItem from './ProjectItem';
import TextWithSvg from './TextWithSVG';
import { ReactComponent as DocumentsSvg } from '../../../../assets/documents.svg';

function CurrentProjects({ handleClick }) {
  const [projectlist, setProjectList] = useState<unknown>();

  useEffect(() => {
    async function fetchProjects() {
      const queryJson = {
        table: 'project',
        order: ['updated_at', 'DESC'],
        limit: 5,
      };

      const currentProjects = await window.electron.ipcRenderer.invoke(
        'fetchRecords',
        queryJson
      );

      setProjectList(currentProjects);
    }

    fetchProjects();
  }, []);

  if (!projectlist) {
    return <ReactLoading type="spin" color="gray" width={40} height={40} />;
  }

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
