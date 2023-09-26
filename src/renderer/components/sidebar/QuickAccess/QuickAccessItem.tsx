import { useState, useEffect } from 'react';
import ListItemPage from '../PageList/ListItemPage';
import BoadItem from '../Board/BoardItem';

function QuickAccesItem({ item, orderArray }) {
  const { target, target_id } = item;
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const query = {
        conditions: {
          id: target_id,
        },
      };

      query.table = target === 'page' ? 'page' : 'folder';

      const result = await window.electron.ipcRenderer.invoke(
        'fetchRecord',
        query
      );
      setData(result);
    };
    fetchData();
  }, [item]);

  return (
    <>
      {data &&
        (target === 'page' ? (
          <ListItemPage pageData={data} orderArray={orderArray} bookmark />
        ) : (
          <BoadItem board={data} orderArray={orderArray} bookmark />
        ))}
    </>
  );
}

export default QuickAccesItem;
