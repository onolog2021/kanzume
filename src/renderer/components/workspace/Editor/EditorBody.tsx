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
import HistorySpace from './History/HistorySpace';
import EditorItem from './EditorItem';

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

  // const changeFontStyle = (font: string) => {
  //   setFontStyle(font);
  // };

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

  // const commitPage = async () => {
  //   // await editor.save();
  //   await window.electron.ipcRenderer.invoke('commitPage', page.id);
  // };

  // function togglePageStatus(param) {
  //   setPageStatus(param);
  // }

  if (!project) {
    return <h1>Loading...</h1>;
  }

  if (pageStatus === 'history') {
    return <HistorySpace pageId={page.id} changeStatus={togglePageStatus} />;
  }

  return (
    <div className="editorBody">
      {page && (
        <>
          <PageTitleForm onBlur={saveTitle} defaultValue={page.title} />
          <EditorItem page={page} />
        </>
      )}
      {/* <Box display="grid" gridTemplateColumns="1fr 24px" position="relative">
        <div id={targetId} className="editorJS" style={style} />
        <div className="editorTools">
          <BookmarkButton page={page} />
          <TextSetting changeFontFunc={changeFontStyle} />
          <Button onClick={commitPage}>JSON出力</Button>
          <Button onClick={() => togglePageStatus('history')}>切り替え</Button>
        </div>
      </Box> */}
    </div>
  );
}

export default EditorBody;
