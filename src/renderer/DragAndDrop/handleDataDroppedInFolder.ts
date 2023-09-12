interface itemData {
  dndId: string;
  type: string;
  id: number;
  area: string;
  parentId: number;
  orderArray: string[];
}

async function handleDataDroppedInFolder(
  order: string[],
  activeItem: itemData,
  overItem: itemData
) {
  if (activeItem.type === 'paper') {
    const position = order.indexOf(activeItem?.dndId);
    const query = {
      table: 'store',
      columns: {
        position,
        folder_id: overItem?.parentId,
      },
      conditions: {
        page_id: activeItem?.id,
        folder_id: activeItem?.parentId,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  }

  if (activeItem.type === 'board') {
    const position = order.indexOf(activeItem?.dndId);
    const query = {
      table: 'folder',
      columns: {
        position,
        parent_id: overItem?.parentId,
        type: 'folder',
      },
      conditions: {
        id: activeItem?.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
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

  if (activeItem.parentId !== overItem.parentId) {
    console.log('fire')
    const query = {
      table: 'store',
      columns: {
        page_id: activeItem.id,
        folder_id: overItem.parentId,
        position: -1,
      },
    };
    await window.electron.ipcRenderer.invoke('insertRecord', query);

    if (activeItem.area === 'folder') {
      const deleteQuery = {
        table: 'store',
        conditions: {
          page_id: activeItem.id,
          folder_id: activeItem.parentId,
        },
      };
      window.electron.ipcRenderer.sendMessage('deleteRecord', deleteQuery);
    }
  }

  const argsArray = [];
  const targetType = ['p', 'f'];
  order.forEach((element, index) => {
    if (targetType.includes(element.charAt(0))) {
      const hash = element.split('-');
      if (hash[0] === 'p') {
        const query = {
          table: 'store',
          columns: {
            position: index,
          },
          conditions: {
            folder_id: overItem?.parentId,
            page_id: parseInt(hash[1]),
          },
        };
        argsArray.push(query);
      } else {
        const query = {
          table: 'folder',
          columns: {
            position: index,
            parent_id: overItem?.parentId,
          },
          conditions: {
            id: parseInt(hash[1]),
          },
        };
        argsArray.push(query);
      }
    }
  });
  window.electron.ipcRenderer.invoke('updateRecords', argsArray);
}

export default handleDataDroppedInFolder;
