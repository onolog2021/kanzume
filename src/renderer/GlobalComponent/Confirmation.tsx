import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';

function Confirmation({ text, isOpen, onclick, closeConfirm }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <DialogTitle sx={{ whiteSpace: 'pre-wrap' }}>{text}</DialogTitle>
      <DialogActions>
        <Button onClick={onclick}>はい</Button>
        <Button onClick={closeConfirm}>いいえ</Button>
      </DialogActions>
    </Dialog>
  );
}
export default Confirmation;
