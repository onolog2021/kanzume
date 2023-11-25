import { ColumnsKeys, FetchRecordQuery } from '../../types/renderElement';
import Node from './Node';

interface ProjectData {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export default class Project {
  id: number;

  title: string;

  created_at: string;

  updated_at: string;

  constructor(data: ProjectData) {
    this.id = data.id;
    this.title = data.title;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  async pages() {
    const query = {
      table: 'page',
      columns: ['id', 'title', 'position'],
      conditions: {
        project_id: this.id,
      },
      order: ['position', 'ASC'],
    };
    return await window.electron.ipcRenderer.invoke('fetchRecords', query);
  }

  async folders() {
    const query = {
      table: 'folder',
      columns: ['id', 'title', 'position', 'parent_id'],
      conditions: {
        project_id: this.id,
        type: 'folder',
      },
      order: ['position', 'ASC'],
    };
    return await window.electron.ipcRenderer.invoke('fetchRecords', query);
  }

  async stores() {
    return await window.electron.ipcRenderer.invoke('getStores', [this.id]);
  }

  async boards() {
    const query: FetchRecordQuery<'folder'> = {
      table: 'folder',
      columns: ['id', 'title', 'position', 'parent_id'],
      conditions: {
        project_id: this.id,
        type: 'board',
      },
      order: ['position', 'ASC'],
    };
    const result = await window.electron.ipcRenderer.invoke(
      'fetchRecords',
      query
    );
    return result;
  }

  async createTree() {
    const folders = await this.folders();
    const pages = await this.pages();
    const stores = await this.stores();
    const root = new Node({ id: this.id, title: this.title, type: 'project' });

    // まず全てのfolderNodeの配列を作る
    const folderNodes = folders.map(
      (folder) =>
        new Node({
          id: folder.id,
          title: folder.title,
          type: 'folder',
          position: folder.position,
        })
    );

    // フォルダを親フォルダに追加する
    folderNodes.forEach((folderNode, i) => {
      if (folders[i].parent_id) {
        const parentNode = folderNodes.find(
          (node) => node.id === folders[i].parent_id
        );
        parentNode?.addChildren(folderNode);
      } else {
        // フォルダが親を持っていない場合、ルートに追加する
        root.addChildren(folderNode);
      }
    });

    // 各ページを振り分ける
    pages.forEach((page) => {
      const storeItem = stores.find((item) => item.page_id === page.id);
      const item = new Node({
        id: page.id,
        title: page.title,
        type: 'page',
        position: storeItem ? storeItem.position : page.position,
      });
      if (storeItem) {
        const folderNode = folderNodes.find(
          (node) => node.id === storeItem.folder_id
        );
        folderNode?.addChildren(item);
      } else {
        root.addChildren(item);
      }
    });

    // position順に並び替え
    const sortTree = (node: Node) => {
      if (!node.children) {
        return;
      }
      node.children.sort((a, b) => a.position - b.position);
      node.children.forEach(sortTree);
    };

    // Sort the tree starting from the root
    sortTree(root);

    return root;
  }
}
