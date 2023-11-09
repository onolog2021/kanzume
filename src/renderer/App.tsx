import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import StartMenu from './components/StartMenu/StartMenu';
import Editor from './Editor';
import './App.scss';
import useTheme from './theme';

export default function App() {
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
