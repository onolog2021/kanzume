import { createTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

function useTheme() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const kanzumeTheme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: '#6b9ebb',
        light: 'white',
        dark: '#1e1e23',
      },
      secondary: {
        main: '#6b9ebb',
        dark: '#5b5b66',
      },
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
              backgroundColor: prefersDarkMode ? 'gray' : 'white',
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
                backgroundColor: prefersDarkMode ? 'transparent' : 'white',
              },
            },
          },
        ],
      },
    },
  });

  return kanzumeTheme;
}

export default useTheme;
