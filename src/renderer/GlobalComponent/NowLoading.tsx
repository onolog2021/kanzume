import { Box } from '@mui/material';
import ReactLoading from 'react-loading';
import theme from 'renderer/theme';

export default function NowLoading({ loading }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <ReactLoading type="spin" color={theme.palette.primary.main} width={40} />
    </Box>
  );
}
