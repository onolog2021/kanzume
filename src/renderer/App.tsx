import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import StartMenu from './components/StartMenu/StartMenu';
import Editor from './Editor';
import './App.scss';
import useTheme from './theme';

export default function App() {
  // const [currentTheme, setCurrentTheme] = useState();

  // useEffect(() => {
  //   const initialMode = prefersDarkMode ? 'dark' : 'light';
  //   const initialTheme = theme(initialMode);
  //   setCurrentTheme(initialTheme);

  //   const changeModeListener = (newMode) => {
  //     console.log(newMode)
  //     const newTheme = theme(newMode);
  //     setCurrentTheme(newTheme);
  //   };

  //   window.electron.ipcRenderer.on('changeMode', changeModeListener);

  // }, []);

  // if (!currentTheme) {
  //   return <h1>loading</h1>;
  // }

  const theme = useTheme();

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<StartMenu />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}
