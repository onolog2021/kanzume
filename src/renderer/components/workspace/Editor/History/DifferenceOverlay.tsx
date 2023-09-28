import { Box, ClickAwayListener, Typography } from '@mui/material';
import { useEffect } from 'react';
import StyledScrollbarBox from 'renderer/GlobalComponent/StyledScrollbarBox';

export default function DifferenceOverlay({ diffText, switchDisplsy }) {
  const switchVisible = () => {
    switchDisplsy(false);
  };

  function baseTextStyle(text: [number, string], index: number) {
    if (text[0] === 0) {
      return <span key={index}>{text[1]}</span>;
    }
    if (text[0] === 1) {
      return (
        <span key={index} style={{ color: 'red', fontWeight: 700 }}>
          {text[1]}
        </span>
      );
    }
    if (text[1].includes('\n')) {
      return <span key={index}>{'\n'}</span>;
    }
  }

  function newTextStyle(text: [number, string], index: number) {
    if (text[0] === 0) {
      return <span key={index}>{text[1]}</span>;
    }
    if (text[0] === 1) {
      // text[1]に改行が含まれている場合のみ、改行だけする
      if (text[1].includes('\n')) {
        return <span key={index}>{'\n'}</span>;
      }
    }
    if (text[0] === -1) {
      return (
        <span key={index} style={{ color: 'blue', fontWeight: 700 }}>
          {text[1]}
        </span>
      );
    }
  }

  const baseText = (
    <>{diffText.map((text, index) => baseTextStyle(text, index))}</>
  );
  const newText = (
    <>{diffText.map((text, index) => newTextStyle(text, index))}</>
  );

  const textStyle = {
    py: 4,
    px: 6,
    '&+p': {
      borderLeft: '1px dashed gray',
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: '#80808096',
        zIndex: 1201,
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <ClickAwayListener onClickAway={switchVisible}>
        <StyledScrollbarBox
          sx={{
            background: 'white',
            width: '80vw',
            height: '100vh',
            m: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            whiteSpace: 'pre-wrap',
          }}
        >
          <Box sx={textStyle}>
            <h4 style={{ marginBottom: 24 }}>現在の内容</h4>
            {baseText}
          </Box>
          <Box sx={textStyle}>
            <h4 style={{ marginBottom: 24 }}>マーカーの内容</h4>
            {newText}
          </Box>
        </StyledScrollbarBox>
      </ClickAwayListener>
    </Box>
  );
}
