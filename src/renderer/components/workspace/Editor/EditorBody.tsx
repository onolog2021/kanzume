import { useEffect, useRef, useContext, useState } from 'react';
import { Button, TextField, InputLabel } from '@mui/material';
import Page from 'renderer/Classes/Page';
import MyEditor from '../../MyEditor';
import {
  CurrentPageContext,
  ProjectContext,
  PageListContext,
} from '../../Context';

function EditorBody({ targetId, page_id }) {
  const [project, setProject] = useContext(ProjectContext);
  const [editor, setEditor] = useState(null);

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

  const addBookmark = () => {};

  if (!project) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <Button onClick={() => addBookmark}>ブクマ</Button>
      <div id={targetId} className="editorJS" />
    </div>
  );
}

export default EditorBody;
