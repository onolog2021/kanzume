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
import PageTitleForm from '../PageTitleForm';
import HistorySpace from './History/HistorySpace';
import EditorItem from './EditorItem';
import EditorTools from './EditorTools';

function EditorBody({ targetId, page_id, title }) {
  const [project, setProject] = useContext(ProjectContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [page, setPage] = useState();
  const [editor, setEditor] = useState(null);
  const [fontStyle, setFontStyle] = useState('Meiryo');
  const [pageStatus, setPageStatus] = useState<'editor' | 'history'>('editor');

  // const style = {
  //   fontFamily: fontStyle,
  // };

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
  }, []);

  // // useEffect(() => {
  // //   if (page_id === currentPage.id && editor) {
  // //     editor.setFirst();
  // //   }
  // // }, [currentPage]);

  // const softDelete = () => {
  //   const query = {
  //     table: 'page',
  //     conditions: {
  //       id: page_id,
  //     },
  //   };
  //   window.electron.ipcRenderer.sendMessage('softDelete', query);
  // };

  const toggleStatus = (status) => {
    setPageStatus(status);
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

  if (pageStatus === 'history') {
    return <HistorySpace pageId={page.id} toggleStatus={toggleStatus} />;
  }

  return (
    <div className="editorBody">
      <Box display="grid" gridTemplateColumns="1fr 40px" position="relative">
        {page && (
          <Box>
            <PageTitleForm onBlur={saveTitle} defaultValue={page.title} />
            <EditorItem page={page} />
          </Box>
        )}
        <EditorTools page={page} toggleStatus={toggleStatus} />
      </Box>
    </div>
  );
}

export default EditorBody;
