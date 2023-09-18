import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';

function PreviewText({ diffText }) {
  const StyledSpan = styled('span')(({ theme, category }) => {
    let color;
    let display;

    switch (category) {
      case 0:
        color = 'black';
        break;
      case -1:
        color = 'blue';
        break;
      default:
        color = 'red';
        display = 'none';
        break;
    }

    return {
      color,
      display,
      // こちらで追加のスタイルを定義することができます
    };
  });
  return (
    <Box sx={{ whiteSpace: 'pre-wrap' }}>
      {diffText &&
        diffText.map((text, index) => (
          <StyledSpan key={index} category={text[0]}>
            {text[1]}
          </StyledSpan>
        ))}
    </Box>
  );
}

export default PreviewText;
