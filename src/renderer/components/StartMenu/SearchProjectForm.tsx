import { useRef, useEffect, useState } from 'react';
import { TextField, Button } from '@mui/material';
import { error } from 'console';
import { ReactComponent as SearchIcon } from '../../../../assets/search.svg';
import TextWithSvg from './TextWithSVG';
import ProjectItem from './ProjectItem';
import ProjectIndex from './ProjectIndex';

export default function SearchProjectForm({ handleClick }) {
  const [searchValue, setSearchValue] = useState('');
  const [projects, setProjects] = useState([]);
  const [matchProject, setMatchProject] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(false);
  const searchRef = useRef();

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
    const values = projects.filter((project) =>
      project.title.includes(searchValue)
    );
    const limitedValues = values.slice(0, 5);
    setMatchProject(limitedValues);
  }, [searchValue]);

  return (
    <>
      <TextWithSvg SvgComponent={SearchIcon} text="既存プロジェクト" />
      <TextField
        inputRef={searchRef}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        size="small"
      />
      <ProjectIndex projectsData={projects} />
      {matchProject.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          handleClick={handleClick}
        />
      ))}
    </>
  );
}
