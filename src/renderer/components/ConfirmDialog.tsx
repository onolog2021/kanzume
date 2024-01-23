import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
} from '@mui/material';

export default function ConfirmDialog({ open, agreeAction, title, content }): {
  open: boolean;
  agreeAction: void;
  title: string;
  content: string;
} {
  const [isOpen, setIsOpen] = useState(open);

  const handleClose = () => {
    setIsOpen(false);
  };

  function execAgreeAction() {
    handleClose();
    agreeAction();
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => execAgreeAction()} autoFocus>
          はい
        </Button>
        <Button onClick={handleClose}>いいえ</Button>
      </DialogActions>
    </Dialog>
  );
}
