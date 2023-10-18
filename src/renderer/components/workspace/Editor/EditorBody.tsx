import { useEffect, useRef, useContext, useState } from 'react';
import { Box } from '@mui/material';
import PlaneTextField from 'renderer/GlobalComponent/PlaneTextField';
import { styled } from '@mui/system';
import NowLoading from 'renderer/GlobalComponent/NowLoading';
import { CurrentPageContext, ProjectContext } from '../../Context';
import HistorySpace from './History/HistorySpace';
import EditorItem from './EditorItem';
import EditorTools from './EditorTools';
import TextSetting from './TextSetting';

type PageSetting = {
  fontSize: number;
  fontFamily: string;
  contentWidth: number;
  lineHeight: number;
};

function EditorBody({ targetId, page_id, title }) {
  const [project, setProject] = useContext(ProjectContext);
  const [page, setPage] = useState();
  const [pageStatus, setPageStatus] = useState<'editor' | 'history'>('editor');
  const titleRef = useRef();
  const [fontSize, setFontSize] = useState<number | undefined>();
  const [fontFamily, setFontFamily] = useState<string | undefined>();
  const [contentWidth, setContentWidth] = useState<number | undefined>();
  const [lineHeight, setLineHeight] = useState<number | undefined>();
  const [editorSetting, setEditorSetting] = useState<PageSetting>();
  const [currentPage] = useContext(CurrentPageContext);
  const [loading, setLoading] = useState(false);
  const [defaultSetting, setDefaultSetting] = useState<PageSetting>();

  useEffect(() => {
    async function getDefaultSetting() {
      const storeSetting = await window.electron.ipcRenderer.invoke(
        'storeGet',
        'defaultPageSetting'
      );
      if (storeSetting) {
        setDefaultSetting(storeSetting);
      } else {
        setDefaultSetting({
          fontSize: 18,
          fontFamily: 'Meiryo',
          contentWidth: 600,
          lineHeight: 1.3,
        });
      }
    }
    getDefaultSetting();
  }, []);

  useEffect(() => {
    async function setPageData() {
      setLoading(true);
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

      const setting = pageData.setting ? JSON.parse(pageData.setting) : {};
      const pageSetting = { ...defaultSetting, ...setting };

      setFontSize(pageSetting.fontSize);
      setFontFamily(pageSetting.fontFamily);
      setContentWidth(pageSetting.contentWidth);
      setLineHeight(pageSetting.lineHeight);
      setEditorSetting(pageSetting);
      setLoading(false);
    }

    setPageData();
  }, [pageStatus, defaultSetting]);

  useEffect(() => {
    if (
      currentPage &&
      currentPage.type === 'editor' &&
      page_id === currentPage.id &&
      contentWidth
    ) {
      const paddingWidth = `calc((100% - ${contentWidth}px) / 2)`;
      document.documentElement.style.setProperty(
        '--editor-padding',
        paddingWidth
      );
    }
  }, [currentPage, contentWidth]);

  const toggleStatus = (status) => {
    setPageStatus(status);
  };

  const saveTitle = async () => {
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
    await window.electron.ipcRenderer.invoke('updateRecord', query);
    window.electron.ipcRenderer.sendMessage('eventReply', 'updatePageList');
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateQuickArea');
  };

  if (!project) {
    return <NowLoading loading={loading} />;
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

  const changeContentWidth = (width: number) => {
    setContentWidth(width);
  };

  const changeLineHeight = (height: number) => {
    setLineHeight(height);
  };

  const textSetting = (
    <TextSetting
      page={page}
      setting={editorSetting}
      changeFontSize={changeFontSize}
      changeFontFamily={changeFontFamily}
      changeContentWidth={changeContentWidth}
      changeLineHeight={changeLineHeight}
    />
  );

  const focusEditor = (event) => {
    event.stopPropagation();
    const tiptap = document.querySelector(`.tiptap-${page_id} .tiptap`);
    if (event.key === 'Enter' && tiptap) {
      event.preventDefault();
      tiptap.focus();
    }
  };

  return (
    <div className={`editorBody tiptap-${page_id}`}>
      <Box display="grid" gridTemplateColumns="1fr 40px" position="relative">
        {page && (
          <Box
            sx={{
              fontSize,
              fontFamily,
              lineHeight,
            }}
          >
            <PlaneTextField
              onBlur={saveTitle}
              placeholder="タイトル"
              defaultValue={page.title}
              inputRef={titleRef}
              onKeyDown={(event) => {
                focusEditor(event);
              }}
              sx={{
                input: {
                  fontSize: 24,
                  pl: `calc((100% - ${contentWidth}px) / 2)`,
                },
              }}
            />
            <EditorItem page={page} isCount />
          </Box>
        )}
        <EditorTools
          page={page}
          toggleStatus={toggleStatus}
          textSetting={textSetting}
        />
      </Box>
    </div>
  );
}

export default EditorBody;
