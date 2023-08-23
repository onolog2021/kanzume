import { useEffect, useRef, useState } from 'react';
import { TextField, Button } from '@mui/material';

export default function CreateProjectForm({ handleClick }) {
  const projectTitleRef = useRef();

  function createNewPage() {
    const projectTitle = projectTitleRef.current.value;
    window.electron.ipcRenderer
      .invoke('createProject', projectTitle)
      .then((result) => {
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
