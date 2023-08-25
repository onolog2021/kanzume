import { useNavigate } from 'react-router-dom';
import CurrentProjects from './CurrentProject';
import CreateProjectForm from './CreateProjectForm';
import LogoImage from '../../../../assets/logo.png';

import SearchProjectForm from './SearchProjectForm';

function StartMenu() {
  const navigate = useNavigate();

  const openProject = (id: number) => {
    navigate('/editor', { state: { project_id: id } });
  };

  return (
    <div className="startMenuWrapper">
      <img src={LogoImage} alt="logo" className="logo" />
      <div className="startMenu">
        <CurrentProjects handleClick={openProject} />
        <div>
          <CreateProjectForm handleClick={openProject} />
          <SearchProjectForm handleClick={openProject} />
        </div>
      </div>
    </div>
  );
}

export default StartMenu;
