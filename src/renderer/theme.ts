import { createTheme } from '@mui/material/styles';
import { text } from 'stream/consumers';

const theme = createTheme({
  palette: {
    primary: { main: '#6b9ebb' },
  },
  typography: {
    fontSize: 24,
    fontFamily: 'Meiryo',
    button: {
      textTransform: 'none',
    },
  },
  mixins: {
    toolbar: {
      minHeight: 42,
    },
  },
  components: {
    MuiList: {
      defaultProps: {
        dense: true,
        sx: {
          py: 0,
        },
      },
    },
    MuiListItemIcon: {
      defaultProps: {
        sx: {
          mr: 0,
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        sx: {
          ':hover': {
            backgroundColor: 'white',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
    MuiButton: {
      defaultProps: {
        style: {
          letterSpacing: 1,
          whiteSpace: 'nowrap',
        },
      },
      variants: [
        {
          props: { variant: 'contained' },
          style: {
            backgroundColor: '#6b9ebb',
            color: 'white',
            padding: '8px 16px',
            boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.1)',
          },
        },
        {
          props: { variant: 'text' },
          style: {
            ':hover': {
              backgroundColor: 'white',
            },
          },
        },
      ],
    },
  },
});

export default theme;
