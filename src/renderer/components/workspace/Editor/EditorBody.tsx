import { useEffect, useRef, useContext, useState } from 'react';
import { Button, Box, InputLabe, Select, MenuItem } from '@mui/material';
import Page from 'renderer/Classes/Page';
import MyEditor from '../../MyEditor';
import {
  CurrentPageContext,
  ProjectContext,
  PageListContext,
} from '../../Context';
import EditorPageTitle from './EditorPageTitle';
import BookmarkButton from './BookmarkButton';
import TextSetting from './TextSetting';
import PageTitleForm from '../PageTitleForm';

function EditorBody({ targetId, page_id, title }) {
  const [project, setProject] = useContext(ProjectContext);
  const [page, setPage] = useState();
  const [editor, setEditor] = useState(null);
  const [fontStyle, setFontStyle] = useState('Meiryo');

  const style = {
    fontFamily: fontStyle,
  };

  useEffect(() => {
    async function setPageData() {
      const query = {
        table: 'page',
        conditions: {
          id: page_id,
        },
      };
      const pageData = await window.electron.ipcRenderer.invoke(
        'fetchRecord',
        query
      );
      setPage(pageData);
    }
    setPageData();

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

  const softDelete = () => {
    const query = {
      table: 'page',
      conditions: {
        id: page_id,
      },
    };
    window.electron.ipcRenderer.sendMessage('softDelete', query);
  };

  const changeFontStyle = (font: string) => {
    setFontStyle(font);
  };

  const saveTitle = (title: string) => {
    const query = {
      table: 'page',
      columns: {
        title,
      },
      conditions: {
        id: page_id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  };

  if (!project) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="editorBody">
      {page && <PageTitleForm onBlur={saveTitle} defaultValue={page.title} />}
      <Box display="grid" gridTemplateColumns="1fr 24px" position="relative">
        <div id={targetId} className="editorJS" style={style} />
        <div className="editorTools">
          <BookmarkButton page={page} />
          <TextSetting changeFontFunc={changeFontStyle} />
        </div>
      </Box>
    </div>
  );
}

export default EditorBody;
