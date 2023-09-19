import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';

function Confirmation({ text, isOpen, onclick, closeConfirm }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <>
      {open && (
        <Dialog open={isOpen}>
          <DialogTitle
            sx={{whiteSpace: 'pre-wrap'}}
          >{text}</DialogTitle>
          <DialogActions>
            <Button onClick={closeConfirm}>いいえ</Button>
            <Button onClick={onclick}>はい</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
export default Confirmation;
