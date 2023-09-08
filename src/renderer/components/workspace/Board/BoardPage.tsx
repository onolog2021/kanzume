import { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField } from '@mui/material';
import MyEditor from 'renderer/components/MyEditor';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Resizable } from 're-resizable';

function Boardpage({ pageData, index, boardId }) {
  const [editor, setEditor] = useState();
  const titleRef = useRef();
  const targetId = `boardItem-${pageData.id}`;
  const resizeRef = useRef()

  const size = {
    width: '100%',
    height: 200,
  };

  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: `bp${pageData.id}`,
    data: {
      area: 'boardBody',
      type: 'paper',
      id: pageData.id,
      parentId: boardId,
    },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

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
    <Resizable defaultSize={size} maxWidth={'100%'} bounds={'HTMLElement'} ref={resizeRef}>
      <Paper
        elevation={3}
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        sx={{
          width: size.width,
          height: size.height,
          p: 4,
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
    </Resizable>
  );
}

export default Boardpage;
