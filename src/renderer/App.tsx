import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Start from './Start';
import Editor from './Editor';
import './App.scss';
import { TabListContext } from './components/Context';
import EditorPage from './EditorPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </Router>
  );
}
