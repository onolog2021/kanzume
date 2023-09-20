import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

const PlaneIconButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  background: 'transparent',
  '&:hover': {
    background: 'transparent',
  },
  '&:active': {
    background: 'transparent',
  },
}));

export default PlaneIconButton;
