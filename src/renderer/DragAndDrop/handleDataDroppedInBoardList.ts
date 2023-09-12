interface itemData {
  dndId: string;
  type: string;
  id: number;
  area: string;
  parentId: number;
  orderArray: string[];
}

async function handleDataDroppedInBoardList(
  order: string[],
  activeItem: itemData,
  overItem: itemData
) {
  const isArea = overItem.area === 'area';

  if (activeItem.type === 'folder') {
    const position = isArea ? -1 : order.indexOf(activeItem?.dndId);
    const query = {
      table: 'folder',
      columns: {
        type: 'board',
        position,
      },
      conditions: {
        id: activeItem?.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  }

  if(isArea){
    return;
  }

  const argsArray = [];
  order.forEach((element, index) => {
    const hash = element.split('-');
    const query = {
      table: 'folder',
      columns: {
        position: index,
      },
      conditions: {
        id: parseInt(hash[1]),
      },
    };
    argsArray.push(query);
  });
  window.electron.ipcRenderer.invoke('updateRecords', argsArray);
}

export default handleDataDroppedInBoardList;
