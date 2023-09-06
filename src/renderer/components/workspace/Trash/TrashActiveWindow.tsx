import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function TrashActiveWindow({ previewItem }) {
  const [page, setPage] = useState();
  const [text, setText] = useState();

  useEffect(() => {
    async function fetchPreviewData() {
      const query = {
        table: 'page',
        conditions: {
          id: previewItem.data.id,
          is_deleted: true,
        },
      };
      const data = await window.electron.ipcRenderer.invoke(
        'fetchRecord',
        query
      );
      setPage(data);

      const textArray = JSON.parse(data.content).blocks;
      const content = [];
      const target = ['paragraph', 'header'];
      textArray.forEach((element) => {
        if (target.includes(element.type)) {
          content.push(element.data);
        }
      });
      setText(content);
      console.log(content)
    }

    if (previewItem) {
      fetchPreviewData();
    }
  }, [previewItem]);

  return (
    <Box
      sx={{
        p: 2,
        borderLeft: '1px solid gray',
      }}
    >
      {text && text.map((paragraph) => <Typography key={paragraph}>{paragraph.text}</Typography>)}
    </Box>
  );
}
