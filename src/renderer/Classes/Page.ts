export default class Page {
  id: number;

  title: string;

  project_id: number;

  position: number;

  content: string;

  private async fetchPageData(id: number, includeContent: boolean) {
    const columns = includeContent
      ? ['id', 'title', 'project_id', 'position', 'content']
      : ['id', 'title', 'project_id', 'position'];
    const query = {
      table: 'page',
      columns,
      conditions: {
        id,
      },
    };
    const pageData = await window.electron.ipcRenderer.invoke(
      'fetchRecord',
      query
    );
    this.id = id;
    this.title = pageData.title;
    this.project_id = pageData.project_id;
    this.position = pageData.position;
    this.content = pageData.content;
  }

  constructor(id: number, includeContent: boolean = false) {
    this.fetchPageData(id, includeContent);
  }

  addBookmark(boolean: boolean) {
    const query = {
      table: 'bookmark',
      columns: {
        target: 'page',
        position: -1,
        project_id: this.project_id,
        target_id: this.id,
      },
    };
    window.electron.ipcRenderer.invoke('insertRecord', query);
  }

  async isBookmarked() {
    const query = {
      table: 'bookmark',
      columns: {
        target: 'page',
        target_id: this.id,
      },
    };
    const result = await window.electron.invoke('fetchRecord', query);
    console.log(result);
  }
}
