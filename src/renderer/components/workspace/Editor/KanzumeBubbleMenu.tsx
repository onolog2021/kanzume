import { useState, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RubyForm from './RubyForm';
import { ReactComponent as BoldIcon } from '../../../../../assets/bold.svg';
import { ReactComponent as RubyIcon } from '../../../../../assets/ruby.svg';

export default function KanzumeBubbleMenu({ editor }) {
  const [onMenu, setOnMenu] = useState<'ruby' | 'search' | null>(null);
  const { selection } = editor;
  const theme = useTheme();

  const buttonStyle = {
    p: 1,
    background:
      theme.palette.mode === 'dark' ? theme.palette.primary.dark : 'white',
    borderRadius: 4,
    border: '.2px solid gray',
  };

  const menuMap = {
    ruby: <RubyForm editor={editor} closeMenu={closeMenu} />,
  };

  function menuToggle(menu: 'ruby' | 'search' | null) {
    setOnMenu(menu);
    editor.commands.focus();
  }
  function closeMenu() {
    setOnMenu(null);
  }

  return (
    <Box
      sx={{
        py: 1,
        px: 2,
        my: 4,
        zIndex: 200,
        border: '.2px solid gray',
        boxShadow: '1px 1px 2px 0px rgba(0, 0, 0, 0.25)',
        borderRadius: 1,
        background:
          theme.palette.mode === 'dark' ? theme.palette.primary.dark : 'white',
      }}
    >
      {onMenu && menuMap[onMenu]}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          width: 'fit-content',
        }}
      >
        <IconButton
          style={buttonStyle}
          onClick={() => editor.chain().toggleBold().focus().run()}
        >
          <BoldIcon style={{ width: 16, height: 16 }} />
        </IconButton>
        <IconButton style={buttonStyle} onClick={() => menuToggle('ruby')}>
          <RubyIcon style={{ width: 16, height: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
