import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import StartMenu from './StartMenu';
import Editor from './Editor';
import './App.scss';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartMenu />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </Router>
  );
}
