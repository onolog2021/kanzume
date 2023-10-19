import Box, { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const StyledScrollbarBox = styled(Box)<BoxProps>(({ theme }) => ({
  overflow: 'auto',
  '&.MuiDrawer-paper': { width: 240, px: 1, minHeight: '100vh' },
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'transparent',
  },
  '&:hover::-webkit-scrollbar-thumb': {
    backgroundColor: '#999',
  },
}));

export default StyledScrollbarBox;
