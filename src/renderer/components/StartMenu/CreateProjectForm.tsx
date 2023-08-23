import { useEffect, useRef, useState } from 'react';
import { TextField, Button } from '@mui/material';

export default function CreateProjectForm({ handleClick }) {
  const projectTitleRef = useRef();

  function createNewPage() {
    const titleValue = projectTitleRef.current.value;
    const title = titleValue || '無題';
    const json = {
      table: 'project',
      columns: {
        title,
      },
    };
    window.electron.ipcRenderer.invoke('insertRecord', json).then((result) => {
      handleClick(result);
    });
  }

  return (
    <>
      <h2>新規作成</h2>
      <TextField
        fullWidth
        size="small"
        label="プロジェクト名"
        inputRef={projectTitleRef}
        sx={{ mb: 2 }}
      />
      <Button size="small" variant="contained" onClick={createNewPage}>
        新規作成
      </Button>
    </>
  );
}
