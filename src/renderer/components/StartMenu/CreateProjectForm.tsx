import { useEffect, useRef, useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import TextWithSvg from './TextWithSVG';
import { ReactComponent as PlusSvg } from '../../../../assets/new.svg';

export default function CreateProjectForm({ handleClick }) {
  const projectTitleRef = useRef();

  const createNewPage = async () => {
    const titleValue = projectTitleRef.current.value;
    const title = titleValue || '無題';
    const json = {
      table: 'project',
      columns: {
        title,
      },
    };
    const newId = await window.electron.ipcRenderer.invoke(
      'insertRecord',
      json
    );
    await window.electron.ipcRenderer.sendMessage('initProject', newId);
    handleClick(newId);
  };

  return (
    <>
      <TextWithSvg SvgComponent={PlusSvg} text="新規作成" />
      <Box display="flex" alignItems="center">
        <TextField
          fullWidth
          size="small"
          label="プロジェクト名"
          inputRef={projectTitleRef}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              createNewPage();
            }
          }}
          sx={{ mr: 2 }}
        />
        <Button size="small" variant="contained" onClick={createNewPage}>
          新規作成
        </Button>
      </Box>
    </>
  );
}
