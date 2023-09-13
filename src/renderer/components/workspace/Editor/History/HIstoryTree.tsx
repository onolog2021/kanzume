import { Box } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import HistoryItem from './HistoryItem';

export default function HistoryTree({ pageId, selectFunc, selected }) {
  const [project] = useContext(ProjectContext);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      const query = {
        page_id: pageId,
        project_id: project.id,
      };
      const result = await window.electron.ipcRenderer.invoke('gitLog', query);
      if (result) {
        setLogs(result.all);
      }
    }

    if (project) {
      fetchLogs();
    }
  }, [project]);

  const selectedFunc = (paramHash: string) => {
    setSelected(paramHash);
  };

  return (
    <Box
      sx={{
        my: 4,
        mx: 12,
        position: 'relative',
        minHeight: 400,
        ':before': {
          content: '""',
          position: 'absolute',
          width: '4px',
          height: '100%',
          top: '24px',
          left: -2,
          backgroundColor: '#D9D9D9',
        },
      }}
    >
      {logs &&
        logs.map((log) => (
          <HistoryItem
            key={log.hash}
            log={log}
            selectFunc={selectFunc}
            selected={selected}
          />
        ))}
    </Box>
  );
}
