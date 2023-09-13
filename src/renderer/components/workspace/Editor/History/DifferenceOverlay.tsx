import { Box, ClickAwayListener, Typography } from '@mui/material';

export default function DifferenceOverlay({ diff, switchDisplsy }) {
  const switchVisible = () => {
    switchDisplsy(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: '#80808096',
        zIndex: 1201,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <Box sx={{
        background: 'white',
        width: 1200,
        height: 1200,
        m: 'auto'
      }}>
        <ClickAwayListener onClickAway={switchVisible}>
          <Typography
            sx={{
              whiteSpace: 'pre-wrap',
            }}
          >
            {diff}
          </Typography>
        </ClickAwayListener>
      </Box>
    </Box>
  );
}
