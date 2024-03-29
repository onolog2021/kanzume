import { Box } from '@mui/material';
import { useState } from 'react';
import HIstoryTree from './HIstoryTree';
import HistoryPreviewWindow from './HistoryPreviewWindow';

export default function HistorySpace({ pageId }) {
  const [selected, setSelected] = useState<string>('');

  const selectFunc = (hash: string) => {
    setSelected(hash);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        maxWidth: '100%',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'start',
      }}
    >
      <HIstoryTree
        pageId={pageId}
        selectFunc={selectFunc}
        selected={selected}
      />
      <HistoryPreviewWindow pageId={pageId} log={selected} />
    </Box>
  );
}
