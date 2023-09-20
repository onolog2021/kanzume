import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { editorTextToPlaneText } from 'renderer/components/GlobalMethods';

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
      if (data) {
        setPage(data);

        const textData = JSON.parse(data.content);
        const content = textData ? editorTextToPlaneText(textData) : null;
        setText(content);
      }
    }

    if (previewItem !== null) {
      fetchPreviewData();
    }
  }, [previewItem]);

  return (
    <Box
      sx={{
        p: 2,
        borderLeft: '1px solid gray',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text && text}
    </Box>
  );
}
