import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import TrashedItem from './TrashedItem';

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
        },
      };
      const trashedFolder = await window.electron.ipcRenderer.invoke(
        'fetchRecords',
        folderQuery
      );
      const combinedItems = trashedPage.concat(trashedFolder);
      setTrashedItems(combinedItems);
      console.log(combinedItems);
    }
    fetchTrashedData();
  }, []);

  return (
    <div>
      {trashedItems &&
        trashedItems.map((item) => <TrashedItem key={item.id} item={item} />)}
    </div>
  );
}

export default TrashBox;
