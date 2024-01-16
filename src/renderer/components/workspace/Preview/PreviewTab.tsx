import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  FetchRecordQuery,
  TabListElement,
} from '../../../../types/renderElement';
import PlaneIconButton from '../../../GlobalComponent/PlaneIconButton';
import { PageElement } from '../../../../types/sqlElement';
import { editorTextToPlaneText } from '../../GlobalMethods';
import { ReactComponent as UpdateButton } from '../../../../../assets/update.svg';

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
        letterSpacing: '0.05em',
        p: 4,
        '&::-webkit-scrollbar': {
          width: '4px',
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent',
        },
        '&:hover::-webkit-scrollbar-thumb': {
          backgroundColor: '#999',
        },
      }}
    >
      <Typography variant="h6" sx={{ ml: 4 }}>
        {tab.title}
      </Typography>
      <Box
        sx={{
          overflowWrap: 'break-word',
        }}
      >
        {editorTextToPlaneText(JSON.parse(page.content))}
      </Box>
      <PlaneIconButton
        sx={{
          position: 'absolute',
          top: '72px',
          right: 4,
        }}
        onClick={() => fetchPage()}
      >
        <UpdateButton width={24} />
      </PlaneIconButton>
    </Box>
  );
}
