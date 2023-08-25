import { Box, Typography } from '@mui/material';

export default function TextWithSvg({ SvgComponent, text }) {
  return (
    <Box display="flex" alignItems="center" mb={2}>
      <SvgComponent width={40} height={40} />
      <Typography variant="h5" sx={{ ml: 2 }}>
        {text}
      </Typography>
    </Box>
  );
}
