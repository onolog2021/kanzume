import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import { Box } from '@mui/material';
import TrashedItem from './TrashedItem';
import TrashActiveWindow from './TrashActiveWindow';
import TrashIndex from './TrashIndex';

function TrashBox() {
  const [project] = useContext(ProjectContext);
  const [selectedItem, setSelectedItem] = useState();
  const [trashedItems, setTrashedItems] = useState([]);

  useEffect(() => {
    async function fetchTrashedData() {
      const pageQuery = {
        table: 'page',
        columns: ['title', 'id'],
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
        columns: ['id', 'title', 'type'],
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

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
      }}
    >
      <TrashIndex items={trashedItems} />
      <TrashActiveWindow />
    </Box>
  );
}

export default TrashBox;
