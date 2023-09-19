import { useEffect, useRef, useContext, useState } from 'react';
import { Button, Box, InputLabe, Select, MenuItem } from '@mui/material';
import Page from 'renderer/Classes/Page';
import PlaneTextField from 'renderer/GlobalComponent/PlaneTextField';
import MyEditor from '../../MyEditor';
import {
  CurrentPageContext,
  ProjectContext,
  PageListContext,
} from '../../Context';
import EditorPageTitle from './EditorPageTitle';
import HistorySpace from './History/HistorySpace';
import EditorItem from './EditorItem';
import EditorTools from './EditorTools';

function EditorBody({ targetId, page_id, title }) {
  const [project, setProject] = useContext(ProjectContext);
  const [page, setPage] = useState();
  const [pageStatus, setPageStatus] = useState<'editor' | 'history'>('editor');
  const titleRef = useRef();
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<string>('serif');

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
  }, [pageStatus]);

  const toggleStatus = (status) => {
    setPageStatus(status);
  };

  const saveTitle = () => {
    const title = titleRef.current.value;
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

  if (pageStatus === 'history') {
    return <HistorySpace pageId={page.id} toggleStatus={toggleStatus} />;
  }

  const changeFontSize = (size: number) => {
    setFontSize(size);
  };

  const changeFontFamily = (family: string) => {
    setFontFamily(family);
  };

  const style = {
    fontSize: fontSize && fontSize,
    fontFamily: fontFamily && fontFamily
  }

  return (
    <div className="editorBody">
      <Box display="grid" gridTemplateColumns="1fr 40px" position="relative">
        {page && (
          <Box sx={style}>
            <PlaneTextField
              onBlur={saveTitle}
              placeholder="タイトル"
              defaultValue={page.title}
              inputRef={titleRef}
              sx={{
                input: {
                  fontSize: 20,
                  pl: 'calc((100% - 600px) / 2)',
                },
              }}
            />
            <EditorItem page={page} isCount />
          </Box>
        )}
        <EditorTools
          page={page}
          toggleStatus={toggleStatus}
          changeFontSize={changeFontSize}
          changeFontFamily={changeFontFamily}
        />
      </Box>
    </div>
  );
}

export default EditorBody;
