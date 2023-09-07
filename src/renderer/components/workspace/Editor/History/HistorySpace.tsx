import { Box } from '@mui/material';
import { useState } from 'react';
import HIstoryTree from './HIstoryTree';
import HistoryPreviewWindow from './HistoryPreviewWindow';

export default function HistorySpace({ pageId }) {
  const [selectedLog, setSelectedLog] = useState();

  const selectLog = (log) => {
    setSelectedLog(log);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        maxWidth: '100%',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <HIstoryTree pageId={pageId} selectFunc={selectLog} />
      <HistoryPreviewWindow pageId={pageId} log={selectedLog} />
    </Box>
  );
}
