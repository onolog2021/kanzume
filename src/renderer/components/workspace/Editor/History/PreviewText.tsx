import { Box, Typography } from '@mui/material';

function PreviewText({ diffText }) {
  function categoryColor(category: number) {
    if (category === 0) {
      return 'black';
    }
    if (category === -1) {
      return 'blue';
    }
    return 'red';
  }

  return (
    <Box sx={{ whiteSpace: 'pre-wrap' }}>
      {diffText &&
        diffText.map((text) => (
          <Typography
            sx={{ color: categoryColor(text[0]), fontWeight: 'bolder' }}
          >
            {text[1]}
          </Typography>
        ))}
    </Box>
  );
}

export default PreviewText;
