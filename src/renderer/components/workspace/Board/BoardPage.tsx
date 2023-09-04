import { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField } from '@mui/material';
import MyEditor from 'renderer/components/MyEditor';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function Boardpage({ pageData, index, boardId }) {
  const [editor, setEditor] = useState();
  const titleRef = useRef();
  const targetId = `boardItem-${pageData.id}`;

  // const { attributes, listeners, setNodeRef, transform } = useSortable({
  //   id: `paper-${pageData.id}`,
  //   data: {
  //     area: 'board-body',
  //     type: 'paper',
  //     itemId: pageData.id,
  //     parentId: boardId,
  //     index,
  //   },
  // });
  // const style = {
  //   transform: CSS.Translate.toString(transform),
  // };

  useEffect(() => {
    const newEditor = new MyEditor(targetId, pageData.id);
    setEditor(newEditor);
  }, []);

  const changeName = (title) => {
    const query = {
      table: 'page',
      columns: {
        title: titleRef.current.value,
      },
      conditions: {
        id: pageData.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  };

  return (
    <Paper
      elevation={3}
      // ref={setNodeRef}
      // style={style}
      // {...listeners}
      // {...attributes}
      sx={{
        width: '100%',
        p: 4,
        height: 400,
        overflow: 'auto',
      }}
    >
      <TextField
        size="small"
        inputRef={titleRef}
        onBlur={changeName}
        defaultValue={pageData.title || null}
      />
      <div id={targetId} />
    </Paper>
  );
}

export default Boardpage;
