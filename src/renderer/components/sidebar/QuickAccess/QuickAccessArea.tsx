import { useState, useEffect, useContext } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import QuickAccesItem from './QuickAccessItem';
import { ReactComponent as QuickLogo } from '../../../../../assets/bookmark.svg';
import CategoryTitle from '../CategoryTitle';
import { useDroppable } from '@dnd-kit/core';

function QuickAccessArea() {
  const [project, setProject] = useContext(ProjectContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [items, setItems] = useState([]);
  const svg = <QuickLogo />;

  const { setNodeRef } = useDroppable({
    id: 'quickAccess',
    data: {area: 'quickAccess'}
  });

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
      <div className="sidebarSectionName">
        <CategoryTitle svg={svg} categoryName="クイックアクセス" />
      </div>
      <div>
        {bookmarks &&
          bookmarks.map((item) => (
            <QuickAccesItem
              key={item.target + item.id}
              item={item}
              items={items}
            />
          ))}
      </div>
    </>
  );
}

export default QuickAccessArea;
