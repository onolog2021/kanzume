import { useState, useEffect, useContext } from 'react';
import { ProjectContext } from 'renderer/components/Context';

function QuickAccessArea() {
  const [project, setProject] = useContext(ProjectContext);
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchBookmarks() {
      const query = {
        table: 'bookmark',
        conditions: {
          project_id: project.id,
        },
      };
      const bookmarkedItems = await window.electron.ipcRenderer.invoke(
        'fetchRecords',
        query
      );
      setItems(bookmarkedItems);
    }
    fetchBookmarks();
  }, []);

  return <h2>クイックアクセス</h2>;
}

export default QuickAccessArea;
