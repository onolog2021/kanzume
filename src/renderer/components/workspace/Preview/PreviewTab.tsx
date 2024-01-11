import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import {
  FetchRecordQuery,
  TabListElement,
} from '../../../../types/renderElement';
import { PageElement } from '../../../../types/sqlElement';

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
    <Box>
      <p>{tab.title}</p>
    </Box>
  );
}
