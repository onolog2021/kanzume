export function collectNames(node) {
  let names = [{ id: node.id, type: node.type }];
  if (node.children) {
    for (const child of node.children) {
      names = names.concat(collectNames(child));
    }
  }
  return names;
}

export function dateTranslateForYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
}
