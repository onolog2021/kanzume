import { Box, Button, ClickAwayListener, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { inherits } from 'util';
import { useTheme } from '@mui/material/styles';
import CreateForm from './PageList/CreateForm';

export default function ProjectSettingWindow({
  closdeWindow,
  title,
  project,
  changeTitlte,
}) {
  const boxRef = useRef();
  const [titleForm, setTitleForm] = useState<Boolean | null>(false);
  const theme = useTheme();

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
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        border: '1px solid gray',
        borderRadius: 2,
        background:
          theme.palette.mode === 'dark' ? theme.palette.primary.dark : 'white',
      }}
    >
      <ClickAwayListener onClickAway={closdeWindow}>
        <Box ref={boxRef}>
          {titleForm ? (
            <CreateForm
              createFunc={changeName}
              setStatus={(param) => setTitleForm(param)}
              initialValue={title}
              label="プロジェクト名"
            />
          ) : (
            <>
              <Typography sx={{ fontSize: 12 }}>プロジェクト名</Typography>
              {title}
              <Button onClick={() => setTitleForm(true)}>変更</Button>
            </>
          )}
        </Box>
      </ClickAwayListener>
    </Box>
  );
}
