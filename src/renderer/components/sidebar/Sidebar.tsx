import { useEffect, useContext } from 'react';
import { ProjectContext } from '../Context';
import OpenTrashBoxButton from './TrashBox/OpenTrashBoxButton';

function SideBar({ project_id, pageList, boardList, quickAccessArea }) {
  const [project, setProject] = useContext(ProjectContext);

  if (!project) {
    return <h1>loading...</h1>;
  }

  return (
    <div className="sideBar">
      <h1>{project.title}</h1>
      {quickAccessArea}
      {pageList}
      {boardList}
      <div className="trashButton">
        <OpenTrashBoxButton />
      </div>
    </div>
  );
}

export default SideBar;
