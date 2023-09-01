import { useState, useRef, useEffect } from 'react';
import { ClickAwayListener, Button, TextField } from '@mui/material';
import ProjectItem from './ProjectItem';

function AdvancedSearchProject({ projects, handleClick }) {
  const [matchProjects, setMatchProjects] = useState(projects);
  const [searchedWord, setSearchedWord] = useState<string>('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMatchProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (searchedWord === '') {
      setMatchProjects(projects);
      return;
    }
    const values = projects.filter((project) =>
      project.title.includes(searchedWord)
    );
    setMatchProjects(values);
  }, [searchedWord]);

  const switchVisible = () => {
    const newstatus = !visible;
    setVisible(newstatus);
  };

  return (
    <>
      <Button
        onClick={switchVisible}
        sx={{ textDecoration: 'underline', textUnderlineOffset: 4 }}
      >
        一覧表示
      </Button>
      {visible ? (
        <div className="advancedSearchProjectWindow">
          <ClickAwayListener onClickAway={switchVisible}>
            <div className="windowContent">
              <h1>プロジェクト一覧</h1>
              <TextField
                size="small"
                onChange={(e) => setSearchedWord(e.target.value)}
                label="プロジェクト名"
                sx={{ my: 2 }}
              />
              {matchProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  handleClick={handleClick}
                />
              ))}
            </div>
          </ClickAwayListener>
        </div>
      ) : null}
    </>
  );
}

export default AdvancedSearchProject;
