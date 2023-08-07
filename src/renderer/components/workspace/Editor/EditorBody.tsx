import { useEffect, useRef, useContext, useState } from 'react';
import { Button, TextField, InputLabel } from '@mui/material';
import MyEditor from '../../MyEditor';
import {
  CurrentPageContext,
  ProjectContext,
  PageListContext,
} from '../../Context';

function EditorBody({ targetId, page_id }) {
  const [project, setProject] = useContext(ProjectContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [pageList, setPageList] = useContext(PageListContext);
  const [editor, setEditor] = useState(null);

  const pageTitleRef = useRef();
  useEffect(() => {
    if (editor) {
      editor.destroy();
    }
    const timer = setInterval(() => {
      if (document.getElementById(targetId)) {
        clearInterval(timer);
        const editorInstance = new MyEditor(targetId, page_id);
        setEditor(editorInstance);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // function editorSave() {
  //   const map = new Map();
  //   const page_title = pageTitleRef.current.value;
  //   // let id = null;
  //   map.set('page_id', id);
  //   map.set('title', page_title);
  //   map.set('project_id', project.id);
  //   map.set('position', 0);
  //   editor.saved(map);
  //   window.electron.ipcRenderer
  //     .invoke('getProjectItems', ['page', project.id])
  //     .then((result) => {
  //       const ary = result.map((row) => row.id);
  //       setPageList(ary);
  //       // 最後に追加する形にしよう。
  //     });
  // }

  if (!project) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <div id={targetId} className="editorJS" />
    </div>
  );
}

export default EditorBody;
