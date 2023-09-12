interface itemData {
  dndId: string;
  type: string;
  id: number;
  area: string;
  parentId: number;
  orderArray: string[];
}

function softDeleteByDrop(
  order: string[],
  activeItem: itemData,
  overItem: itemData
) {
  const deleteQuery = {
    conditions: {
      id: activeItem.id,
    },
  };

  const deleteBookmarkQuery = {
    table: 'bookmark',
    conditions: {
      target_id: activeItem.id,
    },
  };

  if (activeItem.type === 'page' || activeItem.type === 'paper') {
    deleteQuery.table = 'page';
    deleteBookmarkQuery.conditions.target = 'page';
  }

  if (activeItem.type == 'board' || activeItem.type === 'folder') {
    deleteQuery.table = 'folder';
    deleteBookmarkQuery.conditions.target = 'folder';
  }

  if (activeItem.bookmark) {
    window.electron.ipcRenderer.sendMessage(
      'deleteRecord',
      deleteBookmarkQuery
    );
  } else {
    window.electron.ipcRenderer.sendMessage(
      'deleteRecord',
      deleteBookmarkQuery
    );
    window.electron.ipcRenderer.sendMessage('softDelete', deleteQuery);
  }
  window.electron.ipcRenderer.sendMessage('eventReply', 'updateQuickArea');
}

export default softDeleteByDrop;
