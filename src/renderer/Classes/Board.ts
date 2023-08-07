interface BoardData {
  id: number;
  title: string;
}

export default class Board {
  id: number;

  title: string;

  constructor(data: BoardData) {
    this.id = data.id;
    this.title = data.title;
  }

  // 出てくるのはstoreIDなことに注意！
  async pages() {
    return await window.electron.ipcRenderer.invoke('boardChildren', this.id);
  }
}
