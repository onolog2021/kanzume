import { Box, Button, ClickAwayListener, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import CreateForm from './PageList/CreateForm';

export default function ProjectSettingWindow({
  closdeWindow,
  project,
  changeTitlte,
}) {
  const boxRef = useRef();
  const [titleForm, setTitleForm] = useState<Boolean | null>(false);

  const changeName = (title: string) => {
    const query = {
      table: 'project',
      columns: {
        title,
      },
      conditions: {
        id: project.id,
      },
    };
    window.electron.ipcRenderer.invoke('updateRecord', query);
    changeTitlte(title);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        px: 8,
        py: 4,
        background: 'white',
        top: '25%',
        left: '50%',
        border: '1px solid gray',
        borderRadius: 2,
      }}
    >
      <ClickAwayListener onClickAway={closdeWindow}>
        <Box ref={boxRef}>
          {titleForm ? (
            <CreateForm
              createFunc={changeName}
              setStatus={(param) => setTitleForm(param)}
              initialValue={project.title}
              label="プロジェクト名"
            />
          ) : (
            <>
              <Typography sx={{ fontSize: 12 }}>プロジェクト名</Typography>
              {project.title}
              <Button onClick={() => setTitleForm(true)}>変更</Button>
            </>
          )}
        </Box>
      </ClickAwayListener>
    </Box>
  );
}
