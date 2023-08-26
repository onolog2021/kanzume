import { useState, useRef, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import ProjectItem from './ProjectItem';

function AdvancedSearchProject({ projects, handleClick }) {
  const windowRef = useRef(null);
  const contentRef = useRef(null);
  const [matchProjects, setMatchProjects] = useState(projects);
  const [searchedWord, setSearchedWord] = useState<string>('');
  const [visible, setVisible] = useState(false);


  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (windowRef.current && contentRef.current) {
        if (
          windowRef.current.contains(event.target) &&
          !contentRef.current.contains(event.target)
        ) {
          switchVisible();
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

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
      <Button onClick={switchVisible}>一覧表示</Button>
      {visible ? (
        <div className="advancedSearchProjectWindow" ref={windowRef}>
          <div className="windowContent" ref={contentRef}>
            <h1>プロジェクト一覧</h1>
            <TextField
              size="small"
              onChange={(e) => setSearchedWord(e.target.value)}
            />
            {matchProjects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                handleClick={handleClick}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AdvancedSearchProject;
