import { useRef, useState, useContext } from 'react';
import { TextField, Button } from '@mui/material';
import { ProjectContext } from '../../Context';

function CreateBoadButton() {
  const folderTitle = useRef();
  const [open, setOpen] = useState(false);
  const [project] = useContext(ProjectContext);

  return (
    <>
      <Button onClick={handleOpen}>+</Button>
      {open ? (
        <div>
          <TextField size="small" inputRef={folderTitle} />
          <Button onClick={createFolder}>作成</Button>
        </div>
      ) : null}
    </>
  );

  function handleOpen() {
    setOpen(!open);
  }

  function createFolder() {
    const filetitle = folderTitle.current.value;
    window.electron.ipcRenderer
      .invoke('createFolder', [project.id, filetitle])
      .then((result) => {
        getFolders(project.id);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

export default CreateBoadButton;
