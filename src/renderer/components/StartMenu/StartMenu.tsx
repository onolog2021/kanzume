import { useNavigate } from 'react-router-dom';
import { ReactComponent as Logo } from '../../../../assets/logo.svg';
import CurrentProjects from './CurrentProject';
import CreateProjectForm from './CreateProjectForm';

function StartMenu() {
  const navigate = useNavigate();

  const openProject = (id: number) => {
    navigate('/editor', { state: { project_id: id } });
  };

  return (
    <div className="startMenuWrapper">
      <Logo className="logo" />
      <div className="startMenu">
        <CurrentProjects handleClick={openProject} />
        <div>
          <CreateProjectForm handleClick={openProject} />
          <h2>既存プロジェクト</h2>
        </div>
      </div>
    </div>
  );
}

export default StartMenu;
