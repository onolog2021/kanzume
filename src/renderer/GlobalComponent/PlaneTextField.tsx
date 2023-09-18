import TextField, { TextFieldProps } from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const PlaneTextFieldStyle = styled(TextField)<TextFieldProps>(({ theme }) => ({
  '& input': {
    fontWeight: 700,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

export default function PlaneTextField(props: TextFieldProps) {
  return <PlaneTextFieldStyle {...props} />;
}
