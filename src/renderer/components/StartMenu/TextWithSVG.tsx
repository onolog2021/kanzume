import { Box, Typography } from '@mui/material';

export default function TextWithSvg({ SvgComponent, text }) {
  return (
    <Box display="flex" alignItems="center" mb={2}>
      <SvgComponent height={30} />
      <Typography
        variant="h6"
        sx={{
          ml: 2,
          fontWeight: 'bold',
          pt: 0.5,
          textShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
