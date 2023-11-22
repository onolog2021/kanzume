import React, { useRef, useEffect } from 'react';
import { TextField } from '@mui/material';

export default function CreateForm({
  createFunc,
  setStatus,
  initialValue,
  label,
}: {
  createFunc: any;
  setStatus: any;
  initialValue: any;
  label: any;
}) {
  const titleRef = useRef();

  useEffect(() => {
    titleRef.current.focus();
  }, []);

  function runCreateFunc() {
    setStatus(null);
    const title = titleRef.current.value;
    if (title) {
      createFunc(title);
    }
    titleRef.current.value = '';
  }

  const submitByEnterKey = (event) => {
    if (event.key === 'Enter') {
      runCreateFunc();
    }
  };

  return (
    <TextField
      size="small"
      inputRef={titleRef}
      onBlur={() => runCreateFunc()}
      onKeyDown={submitByEnterKey}
      defaultValue={initialValue || null}
      label={label}
    />
  );
}
