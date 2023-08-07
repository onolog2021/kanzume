type NodeItem = {
  id: number;
  title: string;
  type: string;
  position: number;
};

export default class Node {
  id: number;

  title: string;

  type: string;

  position: number;

  children: NodeItem[] | null;

  parent: Object | null;

  constructor(data: NodeItem) {
    this.id = data.id;
    this.title = data.title;
    this.type = data.type;
    this.position = data.position;
    this.children = [];
    this.parent = null;
  }

  adjustForPage() {
    return { id: this.id, title: this.title };
  }

  addChildren(childNode: Node) {
    this.children?.push(childNode);
    childNode.parent = this;
    this.sortChildren();
  }

  findFolder(folderId: number) {
    const folder = this.children?.find((item) => item.id === folderId);
    return folder;
  }

  sortChildren() {
    this.children?.sort((a, b) => a.position - b.position);
  }

  getChildrenAry() {
    const childrenAry = this.children?.map(
      (child) => `${child.type}-${child.id}`
    );
    return childrenAry;
  }
}
