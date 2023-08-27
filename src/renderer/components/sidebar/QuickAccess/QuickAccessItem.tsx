import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

function QuickAccesItem({ item }) {
  const { target, target_id } = item;
  const [data, setData] = useState(null);

  useEffect(() => {
    let query;

    if (target === 'page') {
      query = {
        table: 'page',
        conditions: {
          id: target_id,
        },
      };
    } else {
      query = {
        table: 'folder',
        conditions: {
          id: target_id,
        },
      };
    }

    window.electron.ipcRenderer.invoke('fetchRecord', query).then((result) => {
      setData(result);
      console.log(result)
    });
  }, []);

  if (!data) {
    return <p>loading...</p>;
  }

  return (
    <Box>
      {
        target === 'page' ?
        <span>T</span>:
        <span>F</span>
      }
      <Typography>{data.title}</Typography>
    </Box>
  );
}

export default QuickAccesItem;
