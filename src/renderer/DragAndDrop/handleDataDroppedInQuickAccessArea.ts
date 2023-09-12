interface itemData {
  dndId: string;
  type: string;
  id: number;
  area: string;
  parentId: number;
  orderArray: string[];
}

// クイックアクセスのデータ処理
async function handleDataDroppedInQuickAccessArea(
  order: string[],
  activeItem: itemData,
  overItem: itemData,
  projectId: number
) {
  const isArea = overItem.type === 'area';

  if (activeItem?.area !== overItem.area) {
    const target = activeItem.type === 'page' ? 'page' : 'folder';
    const position = isArea ? -1 : order.indexOf(activeItem?.dndId);
    const query = {
      table: 'bookmark',
      columns: {
        position,
        target,
        target_id: activeItem?.id,
        project_id: projectId,
      },
    };
    await window.electron.ipcRenderer.invoke('insertRecord', query);
  }

  if (isArea) {
    return;
  }

  const queryArgs = [];
  order.forEach((element, index) => {
    const hash = element.split('-');
    const targetHash = ['qp', 'qb'];
    if (targetHash.includes(hash[0])) {
      const target = hash[0] === 'qp' ? 'page' : 'folder';
      const bookmarkQuery = {
        table: 'bookmark',
        columns: {
          position: index,
        },
        conditions: {
          target,
          target_id: parseInt(hash[1]),
        },
      };
      queryArgs.push(bookmarkQuery);
    }
  });
  await window.electron.ipcRenderer.invoke('updateRecords', queryArgs);
}

export default handleDataDroppedInQuickAccessArea;
