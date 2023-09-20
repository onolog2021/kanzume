import { Box, Typography, Tooltip } from '@mui/material';
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
            <s key={index} style={deletedText}>
              {text[1]}
            </s>
          ) : (
            <Tooltip key={index} title="現在、追加されている内容">
              <span key={index} style={categorize(text[0])}>
                {text[1]}
              </span>
            </Tooltip>
          )
        )}
    </Box>
  );
}

export default PreviewText;
