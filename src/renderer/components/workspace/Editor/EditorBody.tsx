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
