import { Box, Typography, Tooltip } from '@mui/material';
import { styled } from '@mui/system';

function PreviewText({ diffText }) {
  const defaultStyle = {
    fontSize: 16,
  };

  const deletedText = {
    ...defaultStyle,
    color: 'red',
  };

  const addedText = {
    ...defaultStyle,
    display: 'none',
    color: 'red',
  };

  function categorize(category: number) {
    if (category === 0) {
      return defaultStyle;
    }
    if (category === 1) {
      return addedText;
    }
    return deletedText;
  }

  return (
    <Box sx={{ whiteSpace: 'pre-wrap' }}>
      {diffText &&
        diffText.map((text, index) =>
          text[0] === -1 ? (
            <span key={index} style={deletedText}>
              {text[1]}
            </span>
          ) : (
            <span key={index} style={categorize(text[0])}>
              {text[1]}
            </span>
          )
        )}
    </Box>
  );
}

export default PreviewText;
