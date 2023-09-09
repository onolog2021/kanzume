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

  addChildren(childNode: Node) {
    this.children?.push(childNode);
    childNode.parent = this;
    this.sortChildren();
  }

  sortChildren() {
    this.children?.sort((a, b) => a.position - b.position);
  }

  createOrderArrayForDndTag() {
    const childrenAry = this.children?.map((child) => {
      if (child.type === 'page') {
        return `p-${child.id}`;
      }
      return `f-${child.id}`;
    });
    return childrenAry;
  }

  getParentNodeId(): number | null {
    if (this.parent && this.parent instanceof Node) {
      return this.parent.id;
    }
    return null;
  }
}
