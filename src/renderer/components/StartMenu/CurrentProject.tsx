import { useEffect, useRef, useState } from 'react';
import { List, Typography } from '@mui/material';
import NowLoading from 'renderer/GlobalComponent/NowLoading';
import ProjectItem from './ProjectItem';
import TextWithSvg from './TextWithSVG';
import { ReactComponent as DocumentsSvg } from '../../../../assets/documents.svg';

function CurrentProjects({ handleClick }) {
  const [projectList, setProjectList] = useState<unknown>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
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
      setLoading(false);
    }

    fetchProjects();
  }, []);

  const noProjects = <Typography>まだプロジェクトはありません</Typography>;

  const projectMap = (
    <List>
      {projectList &&
        projectList.map((project, index) => (
          <ProjectItem
            key={index}
            project={project}
            handleClick={handleClick}
          />
        ))}
    </List>
  );

  let content;

  if (loading) {
    content = <NowLoading loading={loading} />;
  } else if (projectList && projectList.length > 0) {
    content = projectMap;
  } else {
    content = noProjects;
  }

  return (
    <div>
      <TextWithSvg SvgComponent={DocumentsSvg} text="最近のプロジェクト" />
      {content}
    </div>
  );
}

export default CurrentProjects;
