import { useState, useEffect, useContext } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import QuickAccesItem from './QuickAccessItem';

function QuickAccessArea() {
  const [project, setProject] = useContext(ProjectContext);
  const [bookmarks, setBookmarks] = useState([]);
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
      setBookmarks(bookmarkedItems);

      const index = bookmarkedItems.map((item) => item.target + item.id);
      setItems(index);
    }
    fetchBookmarks();
  }, []);

  return (
    <>
      <h2>クイックアクセス</h2>
      {bookmarks &&
        bookmarks.map((item) => (
          <QuickAccesItem
            key={item.target + item.id}
            item={item}
            items={items}
          />
        ))}
    </>
  );
}

export default QuickAccessArea;
