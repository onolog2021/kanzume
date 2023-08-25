import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontSize: 20,
    button: {
      textTransform: 'none',
    },
  },
  MuiTextField: {
    variant: 'outlined',
  },
  mixins: {
    toolbar: {
      minHeight: 42,
    },
  },
});

export default theme;
