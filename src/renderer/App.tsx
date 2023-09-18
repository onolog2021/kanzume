import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import StartMenu from './components/StartMenu/StartMenu';
import Editor from './Editor';
import './App.scss';
import theme from './theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<StartMenu />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
