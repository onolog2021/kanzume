import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';

function PreviewText({ diffText }) {
  const defaultStyle = {
    fontSize: 16,
  };

  const deletedText = {
    ...defaultStyle,
    color: 'blue',
  };

  const addedText = {
    ...defaultStyle,
    color: '#999',
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
        diffText.map((text, index) => (
          <span key={index} style={categorize(text[0])}>
            {text[1]}
          </span>
        ))}
    </Box>
  );
}

export default PreviewText;
