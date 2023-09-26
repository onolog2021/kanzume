import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import { Box, Typography } from '@mui/material';
import TrashActiveWindow from './TrashActiveWindow';
import TrashIndex from './TrashIndex';

interface TrashItem {
  type: string;
  data: any;
}

function TrashBox() {
  const [project] = useContext(ProjectContext);
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null);
  const [trashedItems, setTrashedItems] = useState([]);

  useEffect(() => {
    async function fetchTrashedData() {
      const pageQuery = {
        table: 'page',
        columns: ['title', 'id', 'updated_at'],
        conditions: {
          is_deleted: true,
          project_id: project.id,
        },
      };
      const trashedPage = await window.electron.ipcRenderer.invoke(
        'fetchRecords',
        pageQuery
      );
      const folderQuery = {
        table: 'folder',
        columns: ['id', 'title', 'type', 'updated_at'],
        conditions: {
          is_deleted: true,
          project_id: project.id,
        },
      };
      const trashedFolder = await window.electron.ipcRenderer.invoke(
        'fetchRecords',
        folderQuery
      );
      const combinedItems = trashedPage.concat(trashedFolder);
      combinedItems.sort((a, b) => {
        const dateA = new Date(a.updated_at);
        const dateB = new Date(b.updated_at);

        return dateB - dateA;
      });
      setTrashedItems(combinedItems);
    }

    fetchTrashedData();

    window.electron.ipcRenderer.on(
      'updateTrashIndex',
      (event, newTrashedItems) => {
        fetchTrashedData();
      }
    );
  }, []);

  const changeSelectedItem = (item) => {
    setSelectedItem(item);
  };

  return (
    <Box
      sx={{
        p: 4,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        minHeight: 'calc(100vh - 80px)',
      }}
    >
      {trashedItems && trashedItems.length > 0 ? (
        <>
          <TrashIndex items={trashedItems} click={changeSelectedItem} />
          <TrashActiveWindow previewItem={selectedItem} />
        </>
      ) : (
        <Typography>ゴミ箱の中は空です。</Typography>
      )}
    </Box>
  );
}

export default TrashBox;
