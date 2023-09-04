import { useRef } from 'react';
import { TextField } from '@mui/material';

function PageTitleForm({ onBlur, defaultValue }) {
  const titleRef = useRef();

  const runOnBlurFunc = () => {
    const title = titleRef.current.value
    onBlur(title);
  }

  return (
    <TextField
      inputRef={titleRef}
      defaultValue={defaultValue}
      variant="standard"
      aria-label="title"
      onBlur={runOnBlurFunc}
      sx={{
        '& input': {
          fontWeight: '700',
        },
        '& .MuiInput-underline': {
          ':hover': {
            borderBottom: 'none',
          },
          ':before': {
            borderBottom: 'none',
          },
        },
        '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
          borderBottom: 'none',
        },
      }}
    />
  );
}

export default PageTitleForm;
