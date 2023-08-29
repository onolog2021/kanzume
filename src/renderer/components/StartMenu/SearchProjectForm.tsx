import { useRef, useEffect, useState } from 'react';
import { TextField, Box } from '@mui/material';
import { error } from 'console';
import { ReactComponent as SearchIcon } from '../../../../assets/search.svg';
import TextWithSvg from './TextWithSVG';
import ProjectItem from './ProjectItem';
import ProjectIndex from './ProjectIndex';
import AdvancedSearchProject from './AdvancedSearchProject';

export default function SearchProjectForm({ handleClick }) {
  const [searchValue, setSearchValue] = useState('');
  const [projects, setProjects] = useState([]);
  const [matchProject, setMatchProject] = useState([]);

  useEffect(() => {
    const query = {
      table: 'project',
      order: ['title', 'ASC'],
    };
    window.electron.ipcRenderer
      .invoke('fetchRecords', query)
      .then((result) => {
        setProjects(result);
      })
      .catch((error) => console.warn(error));
  }, []);

  useEffect(() => {
    if (searchValue === '') {
      setMatchProject([]);
      return;
    }
    const values = projects.filter((project) =>
      project.title.includes(searchValue)
    );
    const limitedValues = values.slice(0, 5);
    setMatchProject(limitedValues);
  }, [searchValue]);

  return (
    <div className="searchProjects">
      <TextWithSvg SvgComponent={SearchIcon} text="既存プロジェクト" />
      <Box display="flex">
        <TextField
          value={searchValue}
          label="プロジェクト名"
          onChange={(e) => setSearchValue(e.target.value)}
          size="small"
          sx={{ mr: 2 }}
        />
        <AdvancedSearchProject projects={projects} handleClick={handleClick} />
      </Box>

      {matchProject.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          handleClick={handleClick}
        />
      ))}
    </div>
  );
}
