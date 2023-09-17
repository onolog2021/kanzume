import { useRef, useEffect } from 'react';
import { TextField, Button } from '@mui/material';

export default function RubyForm({ editor, closeMenu }) {
  const rubyRef = useRef('');

  useEffect(() => {
    if (rubyRef.current) {
      rubyRef.current.focus();
    }
  }, []);

  function setRuby() {
    const rubyReading = rubyRef.current.value;
    editor.commands.toggleRuby();
    editor.commands.setRubyReading(rubyReading);
    rubyRef.current.value = '';
    closeMenu();
    editor.commands.focus();
  }

  function deleteRuby() {
    editor.commands.toggleRuby();
  }

  function isRuby() {
    const editorState = editor.state;
    const { $from, $to } = editor.state.selection;
    let check;
    for (let { pos } = $from; pos < $to.pos; pos++) {
      const node = editorState.doc.nodeAt(pos);
      if (node && node.type.name === 'span') {
        check = true;
      }
    }
    check = false;
  }

  return (
    <>
      <TextField inputRef={rubyRef} size="small" />
      <Button
        onClick={() => setRuby()}
        sx={{
          display: 'block',
          color: 'gray',
          textAlign: 'center',
          m: '0 auto',
        }}
      >
        決定
      </Button>
    </>
  );
}
