import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import {
  FetchRecordQuery,
  TabListElement,
} from '../../../../types/renderElement';
import { PageElement } from '../../../../types/sqlElement';
import { editorTextToPlaneText } from '../../GlobalMethods';

export default function PreviewTab({ tab }: { tab: TabListElement }) {
  const [page, setPage] = useState<PageElement | null>(null);

  async function fetchPage() {
    const query: FetchRecordQuery<'page'> = {
      table: 'page',
      conditions: {
        id: tab.id,
      },
    };
    const data = await window.electron.ipcRenderer.invoke('fetchRecord', query);
    setPage(data);
  }

  useEffect(() => {
    fetchPage();
  }, [tab]);

  if (page === null) {
    return <p>loading...</p>;
  }

  return (
    <Box
      sx={{
        whiteSpace: 'pre-wrap',
        writingMode: 'vertical-rl',
        textOrientation: 'upright',
        maxHeight: `calc(${window.innerHeight}px - 80px)`,
        overflowX: 'auto',
        width: '100%',
        '&::-webkit-scrollbar': {
          width: '4px',
          height: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent',
        },
        '&:hover::-webkit-scrollbar-thumb': {
          backgroundColor: '#999',
        },
      }}
    >
      <p>{tab.title}</p>
      <Box
        sx={{
          overflowWrap: 'break-word',
        }}
      >
        {editorTextToPlaneText(JSON.parse(page.content))}
      </Box>
    </Box>
  );
}
