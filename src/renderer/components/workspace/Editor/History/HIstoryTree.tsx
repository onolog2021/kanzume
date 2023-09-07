import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import HistoryItem from './HistoryItem';

export default function HistoryTree({ pageId, selectFunc }) {
  const [project] = useContext(ProjectContext);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      const query = {
        page_id: pageId,
        project_id: project.id,
      };
      const result = await window.electron.ipcRenderer.invoke('gitLog', query);
      setLogs(result.all);
    }

    if (project) {
      fetchLogs();
    }
  }, [project]);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 400,
        ':before': {
          content: '""',
          position: 'absolute',
          width: '2px',
          height: 100,
          top: '24px',
          left: -2,
          backgroundColor: 'gray',
        },
      }}
    >
      {logs &&
        logs.map((log) => (
          <HistoryItem key={log.hash} log={log} selectFunc={selectFunc} />
        ))}
    </Box>
  );
}
