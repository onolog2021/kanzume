import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import StartMenu from './components/StartMenu/StartMenu';
import Editor from './Editor';
import './App.scss';
import theme from './theme';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    const initialMode = prefersDarkMode ? 'dark' : 'light';
    const initialTheme = theme(initialMode);
    setCurrentTheme(initialTheme);

    const changeModeListener = (newMode) => {
      console.log(newMode)
      const newTheme = theme(newMode);
      setCurrentTheme(newTheme);
    };

    window.electron.ipcRenderer.on('changeMode', changeModeListener);

  }, []);

  if (!currentTheme) {
    return <h1>loading</h1>;
  }

  return (
    <Router>
      <ThemeProvider theme={theme('light')}>
        <Routes>
          <Route path="/" element={<StartMenu />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}
