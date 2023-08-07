interface PageData {
  id: number;
  title: string;
  project_id: number;
  position: number;
  content: string;
}

export default class Page {
  id: number;

  title: string;

  project_id: number;

  position: number;

  content: string;

  constructor(data: PageData) {
    this.id = data.id;
    this.title = data.title;
    this.project_id = data.project_id;
    this.position = data.position;
    this.content = data.content;
  }

  bookmarking(boolean: boolean) {
    window.electron.ipcRenderer.sendMessage('bookmarking', [
      'page',
      this.id,
      boolean,
    ]);
  }
}
