export async function updatePageList(projectId: number) {
  const pagesData = await window.electron.ipcRenderer.invoke(
    'getProjectItems',
    ['page', projectId]
  );
  const newAry = pagesData.map((element) => ({
    id: element.id,
    title: element.title,
  }));
  return newAry;
}

export function collectNames(node) {
  let names = [{ id: node.id, type: node.type }];
  if (node.children) {
    for (const child of node.children) {
      names = names.concat(collectNames(child));
    }
  }
  return names;
}
