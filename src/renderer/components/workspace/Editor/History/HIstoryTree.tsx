import { Box, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import ReactLoading from 'react-loading';
import theme from 'renderer/theme';
import StyledScrollbarBox from 'renderer/GlobalComponent/StyledScrollbarBox';
import HistoryItem from './HistoryItem';

export default function HistoryTree({ pageId, selectFunc, selected }) {
  const [project] = useContext(ProjectContext);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const query = {
        page_id: pageId,
        project_id: project.id,
      };
      const result = await window.electron.ipcRenderer.invoke('gitLog', query);
      if (result) {
        setLogs(result.all);
      }
      setLoading(false);
    }

    if (project) {
      fetchLogs();
    }
  }, [project]);

  const selectedFunc = (paramHash: string) => {
    setSelected(paramHash);
  };

  if (logs && logs.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ textAlign: 'center' }}>
          まだタイムラインは作成されていません。
        </Typography>
      </Box>
    );
  }

  return (
    <StyledScrollbarBox sx={{ maxHeight: 'calc(100vh - 200px)' }}>
      {loading && loading ? (
        <ReactLoading
          type="spin"
          color={theme.palette.primary.main}
          width={40}
          height={40}
        />
      ) : (
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
            logs.map((log, index) => (
              <HistoryItem
                key={index}
                log={log}
                selectFunc={selectFunc}
                selected={selected}
              />
            ))}
        </Box>
      )}
    </StyledScrollbarBox>
  );
}
