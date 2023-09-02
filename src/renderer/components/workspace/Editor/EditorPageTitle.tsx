import { useRef } from 'react';
import { TextField } from '@mui/material';

function EditorPageTitle({ page }) {
  const { id, title } = page;
  const titleRef = useRef();
  const saveTitle = () => {
    const newTitle = titleRef.current.value;
    const query = {
      table: 'page',
      columns: {
        title: newTitle,
      },
      conditions: {
        id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  };

  return (
    <TextField
      className="editor-title"
      inputRef={titleRef}
      onChange={saveTitle}
      defaultValue={title}
      variant="standard"
      aria-label="title"
      sx={{
        '& input': {
          fontWeight: '700',
        },
        '& .MuiInput-underline': {
          ':hover': {
            borderBottom: 'none',
          },
          ':before': {
            borderBottom: 'none',
          },
        },
        '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
          borderBottom: 'none',
        },
      }}
    />
  );
}

export default EditorPageTitle;
