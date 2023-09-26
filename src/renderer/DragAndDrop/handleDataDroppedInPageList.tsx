interface itemData {
  dndId: string;
  type: string;
  id: number;
  area: string;
  parentId: number;
  orderArray: string[];
}

async function handleDataDroppedInPageList(
  order: string[],
  activeItem: itemData,
  overItem: itemData
) {
  const isArea = overItem.type === 'area';

  if (activeItem.type === 'paper' || activeItem.area === 'folder') {
    const deleteStoreQuery = {
      table: 'store',
      conditions: {
        page_id: activeItem?.id,
        folder_id: activeItem?.parentId,
      },
    };
    window.electron.ipcRenderer.sendMessage('deleteRecord', deleteStoreQuery);

    const position = isArea ? -1 : order.indexOf(activeItem?.dndId);
    const updatePaperQuery = {
      table: 'page',
      columns: {
        position,
      },
      conditions: {
        id: activeItem?.id,
      },
    };
    window.electron.ipcRenderer.invoke('updateRecord', updatePaperQuery);
  }

  if (activeItem.type === 'board') {
    const position = isArea ? -1 : order.indexOf(activeItem?.dndId);
    const updateFolderQuery = {
      table: 'folder',
      columns: {
        type: 'folder',
        position,
      },
      conditions: {
        id: activeItem?.id,
      },
    };
    window.electron.ipcRenderer.invoke('updateRecord', updateFolderQuery);

    const deleteBookmarkQuery = {
      table: 'bookmark',
      conditions: {
        target: 'folder',
        target_id: activeItem?.id,
      },
    };
    window.electron.ipcRenderer.sendMessage(
      'deleteRecord',
      deleteBookmarkQuery
    );
  }

  if (isArea) {
    return;
  }

  const argsArray = [];
  const targetType = ['p', 'f'];
  order.forEach((element, index) => {
    const hash = element.split('-');
    if (targetType.includes(element.charAt(0))) {
      const query = {
        table: element.charAt(0) === 'p' ? 'page' : 'folder',
        columns: {
          position: index,
        },
        conditions: {
          id: parseInt(hash[1]),
        },
      };
      argsArray.push(query);
    }
  });
  window.electron.ipcRenderer.invoke('updateRecords', argsArray);
}

export default handleDataDroppedInPageList;
