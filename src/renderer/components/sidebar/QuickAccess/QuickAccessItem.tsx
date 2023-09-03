import { useState, useEffect } from 'react';
import ListItemPage from '../PageList/ListItemPage';
import BoadItem from '../Board/BoardItem';

function QuickAccesItem({ item, items }) {
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
      console.log(result);
    };
    fetchData();
  }, []);

  return (
    <>
      {data &&
        (target === 'page' ? (
          <ListItemPage pageData={data} index={items} />
        ) : (
          <BoadItem board={data} index={items} />
        ))}
    </>
  );
}

export default QuickAccesItem;
