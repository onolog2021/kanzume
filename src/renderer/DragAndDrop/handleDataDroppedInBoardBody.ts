import { act } from 'react-test-renderer';

interface itemData {
  dndId: string;
  type: string;
  id: number;
  area: string;
  parentId: number;
  orderArray: string[];
}

async function handleDataDroppedInBoardBody(
  order: string[],
  activeItem: itemData,
  overItem: itemData
) {
  const isArea = overItem.type === 'area';

  if (activeItem.type === 'page') {
    const position = isArea ? -1 : order.indexOf(activeItem?.dndId);
    const query = {
      table: 'store',
      columns: {
        position,
        folder_id: overItem?.parentId,
        page_id: activeItem?.id,
      },
    };
    await window.electron.ipcRenderer.invoke('insertRecord', query);

    const deleteQuery = {
      table: 'store',
      conditions: {
        page_id: activeItem.id,
        folder_id: activeItem.parentId,
      },
    };
    window.electron.ipcRenderer.sendMessage('deleteRecord', deleteQuery);
  }

  if (isArea) {
    return;
  }

  const argsArray = [];

  order.forEach((element, index) => {
    const hash = element.split('-');
    if (hash.includes('bp')) {
      const query = {
        table: 'store',
        columns: {
          position: index,
        },
        conditions: {
          page_id: parseInt(hash[1]),
          folder_id: overItem?.parentId,
        },
      };
      argsArray.push(query);
    }
    window.electron.ipcRenderer.invoke('updateRecords', argsArray);
  });
}

export default handleDataDroppedInBoardBody;
