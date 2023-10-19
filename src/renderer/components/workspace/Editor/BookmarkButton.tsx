import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

import { ReactComponent as Bookmark } from '../../../../../assets/bookmark.svg';

function BookmarkButton({ page }) {
  const [bookmark, setBookmark] = useState<Boolean>();
  const theme = useTheme();

  useEffect(() => {
    if (page) {
      const query = {
        table: 'bookmark',
        conditions: {
          target: 'page',
          target_id: page.id,
        },
      };
      window.electron.ipcRenderer
        .invoke('fetchRecord', query)
        .then((result) => {
          setBookmark(!!result);
        })
        .catch((error) => {
          console.warn(error);
        });
    }
  }, [page]);

  const changeBookmark = () => {
    if (bookmark) {
      removeBookmark();
    } else {
      addBookmark();
    }
  };

  const addBookmark = async () => {
    const query = {
      table: 'bookmark',
      columns: {
        target: 'page',
        target_id: page.id,
        position: -1,
        project_id: page.project_id,
      },
    };
    await window.electron.ipcRenderer.invoke('insertRecord', query);
    setBookmark(true);
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateQuickArea');
  };

  const removeBookmark = () => {
    const query = {
      table: 'bookmark',
      conditions: {
        target: 'page',
        target_id: page.id,
        project_id: page.project_id,
      },
    };
    window.electron.ipcRenderer.sendMessage('deleteRecord', query);
    setBookmark(false);
    window.electron.ipcRenderer.sendMessage('eventReply', 'updateQuickArea');
  };

  return (
    <Bookmark
      style={{
        fill: bookmark ? theme.palette.primary.main : 'gray',
      }}
      onClick={changeBookmark}
    />
  );
}

export default BookmarkButton;
