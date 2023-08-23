interface FolderData {
  id: number;
  title: string;
  project_id: number;
  position: number;
  type: string;
}

export default class Folder {
  id: number;

  title: string;

  project_id: number;

  position: number;

  type: string;

  constructor(data: FolderData) {
    this.id = data.id;
    this.title = data.title;
    this.project_id = data.project_id;
    this.position = data.position ?? 0;
    this.type = data.type ?? 'folder';
  }

  async pages() {
    const pagesData = await window.electron.ipcRenderer.invoke(
      'findChildPage',
      this.id
    );
    return pagesData;
  }

  async create() {
    const columns = {
      id: this.id,
      title: this.title,
      project_id: this.project_id,
      position: this.position,
      type: this.type,
    };
    const folderArgs = {
      table: 'folder',
      columns,
    };
    const result = await window.electron.ipcRenderer.invoke(
      'insertRecord',
      folderArgs
    );
    return result;
  }

  bookmarking(boolean: boolean) {
    window.electron.ipcRenderer.sendMessage('bookmarking', [
      'folder',
      this.id,
      boolean,
    ]);
  }
}
