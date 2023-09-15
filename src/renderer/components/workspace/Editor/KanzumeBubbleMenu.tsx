import { useState, useRef } from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function KanzumeBubbleMenu({ editor }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState();
  const rubiValueRef = useRef();

  const addRubi = () => {
    const { selection } = editor.state;
    const selectedText = editor.state.doc.textBetween(
      selection.from,
      selection.to
    );
    if (selectedText) {
      // const rubyTaggedText = `<ruby>${selectedText}</ruby>`;
      // editor.chain().focus().setRuby().run();
      editor.chain().wrapRuby().run();
    }
    setSelected(selectedText);
    setOpen(true);
  };

  const rubiForm = (
    <Box
      sx={{
        display: open ? 'block' : 'none',
      }}
    >
      <p>{selected}</p>
      <TextField inputRef={rubiValueRef} />
      {/* <Button onClick={}>決定</Button> */}
    </Box>
  );

  return (
    <Box sx={{ background: 'white' }}>
      {rubiForm}

      <button onClick={() => editor.chain().toggleBold().focus().run()}>
        Bold
      </button>
      <button onClick={addRubi}>Ruby</button>
    </Box>
  );
}
