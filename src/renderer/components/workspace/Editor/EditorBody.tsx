import { useEffect, useRef, useContext, useState } from 'react';
import { Button, TextField, InputLabe, Select, MenuItem } from '@mui/material';
import Page from 'renderer/Classes/Page';
import MyEditor from '../../MyEditor';
import {
  CurrentPageContext,
  ProjectContext,
  PageListContext,
} from '../../Context';

function EditorBody({ targetId, page_id, title }) {
  const [project, setProject] = useContext(ProjectContext);
  const [editor, setEditor] = useState(null);
  const [bookmark, setBookmark] = useState(false);
  const titleRef = useRef();
  const [fontStyle, setFontStyle] = useState('');
  const [fontList, setFontList] = useState({});

  const style = {
    fontFamily: fontStyle,
  };

  useEffect(() => {
    setFontStyle('Meiryo');
    const list = {
      游ゴシック: 'YuGothic',
      メイリオ: 'Meiryo',
      'ＭＳ ゴシック': 'MS Gothic',
      'ＭＳ 明朝': 'MS Mincho',
      ヒラギノ角ゴシック: 'Hiragino Kaku Gothic',
      ヒラギノ明朝: 'Hiragino Mincho',
      小塚ゴシック: 'Kozuka Gothic',
      小塚明朝: 'Kozuka Mincho',
      'Source Han Sans': 'Source Han Sans',
      'Source Han Serif': 'Source Han Serif',
      'Noto Sans CJK': 'Noto Sans CJK',
      'Noto Serif CJK': 'Noto Serif CJK',
    };
    setFontList(list);
    const query = {
      table: 'bookmark',
      conditions: {
        target: 'page',
        target_id: page_id,
      },
    };
    window.electron.ipcRenderer.invoke('fetchRecord', query).then((result) => {
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

  const saveTitle = () => {
    const newTitle = titleRef.current.value;
    const query = {
      table: 'page',
      columns: {
        title: newTitle,
      },
      conditions: {
        id: page_id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
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

  const changeFontStyle = (event) => {
    const newFontStyle = event.target.value;
    setFontStyle(newFontStyle);
  };

  if (!project) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <TextField
        inputRef={titleRef}
        onChange={saveTitle}
        defaultValue={title}
      />
      {bookmark ? <p>ブクマ済み</p> : null}
      <Button onClick={changeBookmark}>ブクマ</Button>
      <Button onClick={softDelete}>削除</Button>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={fontStyle}
        onChange={changeFontStyle}
      >
        {fontList &&
          Object.entries(fontList).map(([key, value]) => (
            <MenuItem value={value as string} key={value as string}>
              {key}
            </MenuItem>
          ))}
      </Select>
      <div id={targetId} className="editorJS" style={style} />
    </div>
  );
}

export default EditorBody;
