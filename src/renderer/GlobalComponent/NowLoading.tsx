import { Box } from '@mui/material';
import ReactLoading from 'react-loading';
import { useTheme } from '@mui/material/styles';

export default function NowLoading({ loading }) {
  const theme = useTheme();
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
