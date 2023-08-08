export function collectNames(node) {
  let names = [{ id: node.id, type: node.type }];
  if (node.children) {
    for (const child of node.children) {
      names = names.concat(collectNames(child));
    }
  }
  return names;
}
