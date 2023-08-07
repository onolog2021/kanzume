import { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import MyEditor from 'renderer/components/MyEditor';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function Boardpage({ pageData, index, boardId }) {
  const [editor, setEditor] = useState();
  const targetId = `boardItem-${pageData.id}`;

  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: `paper-${pageData.id}`,
    data: { type: 'paper', itemId: pageData.id, parentId: boardId,index },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  useEffect(() => {
    const newEditor = new MyEditor(targetId, pageData.id);
  }, []);

  return (
    <Paper
      elevation={2}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <h1>{pageData.title}</h1>
      <div id={targetId} />
    </Paper>
  );
}

export default Boardpage;
