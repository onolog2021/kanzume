import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import LogoImage from '../../../../assets/logo.png';

function NoSpace() {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(25%, -50%)',
  };

  return (
    <Box sx={{ height: '100vh' }}>
      <Box sx={style}>
        <img
          src={LogoImage}
          alt="logo"
          className="logo"
          style={{ margin: '0 auto', display: 'block', opacity: 0.7, width:120 }}
        />
        {/* <Typography
          sx={{
            mt: 4,
            fontSize: 20,
            textAlign: 'center',
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          KANZUMEエディタへようこそ!
        </Typography> */}
      </Box>
    </Box>
  );
}

export default NoSpace;
