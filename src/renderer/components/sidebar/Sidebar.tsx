import { useEffect, useContext } from 'react';
import Project from 'renderer/Classes/Project';
import PageList from './PageList/PageList';
import Board from './Board/Board';
import { ProjectContext } from '../Context';

function SideBar({ project_id, pageList, boardList }) {
  const [project, setProject] = useContext(ProjectContext);

  if (!project) {
    return <h1>loading...</h1>;
  }

  return (
    <div id="sideBar">
      <a href="/">start</a>
      {pageList}
      {boardList}
    </div>
  );
}

export default SideBar;
