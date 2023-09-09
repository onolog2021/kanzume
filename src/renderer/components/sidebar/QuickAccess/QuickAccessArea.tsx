import { useState, useEffect, useContext } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import QuickAccesItem from './QuickAccessItem';
import { ReactComponent as QuickLogo } from '../../../../../assets/bookmark.svg';
import CategoryTitle from '../CategoryTitle';

function QuickAccessArea() {
  const [project, setProject] = useContext(ProjectContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [items, setItems] = useState([]);
  const svg = <QuickLogo />;

  const { setNodeRef } = useDroppable({
    id: 'quickAccess',
    data: { area: 'quickAccess' },
  });

  useEffect(() => {
    async function fetchBookmarks() {
      const query = {
        table: 'bookmark',
        conditions: {
          project_id: project.id,
        },
        order: ['position', 'ASC'],
      };
      const bookmarkedItems = await window.electron.ipcRenderer.invoke(
        'fetchRecords',
        query
      );
      setBookmarks(bookmarkedItems);

      const index = bookmarkedItems.map((item) => {
        if (item.target === 'page') {
          return `qp-${item.target_id}`;
        }
        return `qb-${item.target_id}`;
      });
      setItems(index);
    }
    fetchBookmarks();
    window.electron.ipcRenderer.on('updateQuickArea', () => {
      fetchBookmarks();
    });
  }, []);

  return (
    <>
      <div className="sidebarSectionName">
        <CategoryTitle svg={svg} categoryName="クイックアクセス" />
      </div>
      {items && (
        <SortableContext items={items}>
          {bookmarks &&
            bookmarks.map((item) => (
              <QuickAccesItem
                key={item.target + item.id}
                item={item}
                orderArray={items}
              />
            ))}
        </SortableContext>
      )}
    </>
  );
}

export default QuickAccessArea;
