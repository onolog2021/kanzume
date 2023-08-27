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
  const [bookmark, setBookmark] = useState(false);

  useEffect(() => {
    const query = {
      table: 'bookmark',
      conditions: {
        target: 'page',
        target_id: page_id,
      },
    };
    window.electron.ipcRenderer.invoke('fetchRecord', query).then((result) => {
      console.log(result);
      setBookmark(!!result);
    });

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

  const changeBookmark = () => {
    if (bookmark) {
      removeBookmark();
    } else {
      addBookmark();
    }
  };

  const addBookmark = () => {
    const query = {
      table: 'bookmark',
      columns: {
        target: 'page',
        target_id: page_id,
        position: -1,
        project_id: project.id,
      },
    };
    window.electron.ipcRenderer.invoke('insertRecord', query);
    setBookmark(true);
  };

  const removeBookmark = () => {
    const query = {
      table: 'bookmark',
      conditions: {
        target: 'page',
        target_id: page_id,
        project_id: project.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('deleteRecord', query);
    setBookmark(false);
  };

  const softDelete = () => {
    const query = {
      table: 'page',
      conditions: {
        id: page_id,
      },
    };
    window.electron.ipcRenderer.sendMessage('softDelete', query);
  };

  if (!project) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      {bookmark ? <p>ブクマ済み</p> : null}
      <Button onClick={changeBookmark}>ブクマ</Button>
      <Button onClick={softDelete} >削除</Button>
      <div id={targetId} className="editorJS" />
    </div>
  );
}

export default EditorBody;
