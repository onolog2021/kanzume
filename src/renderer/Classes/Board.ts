// export type BoardElement = {
//   id: number;
//   title: string;
//   position: number;
//   project_id: number;
//   parent_id: number | null;
//   is_deleted: boolean;
// };
import { FolderElement } from '../../@types/sqlElement';

export default class Board {
  id: number;

  title: string;

  constructor(data: FolderElement) {
    this.id = data.id;
    this.title = data.title;
  }

  async pages() {
    return await window.electron.ipcRenderer.invoke('boardChildren', [this.id]);
  }
}
