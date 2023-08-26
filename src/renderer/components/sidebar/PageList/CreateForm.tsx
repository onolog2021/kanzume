import { useRef, useEffect } from 'react';
import { TextField } from '@mui/material';

export default function CreateForm({ createFunc, setStatus }) {
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
    />
  );
}
