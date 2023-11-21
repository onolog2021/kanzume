import { FetchRecordQuery } from '../../types/renderElement';
import { FolderElement, PageElement } from '../../types/sqlElement';

// 直系の子供フォルダを取得
async function childrenFolder(id: number) {
  const query: FetchRecordQuery<'folder'> = {
    table: 'folder',
    conditions: {
      parent_id: id,
    },
  };

  const result = await window.electron.ipcRenderer.invoke(
    'fetchRecords',
    query
  );

  return result;
}

// 階層下のボード内のフォルダをすべて取得
async function createBoardTree(
  paretntBoardId: number,
  parentArray: FolderElement[] = []
): Promise<FolderElement[]> {
  // ボードのページチルドレンを取得
  const children: FolderElement[] = await childrenFolder(paretntBoardId);
  parentArray.push(...children);

  // もしボードにストアがあり、それがparent_idを持つものであれば、そのフォルダがのparent_idを取得
  if (children && children.length > 0) {
    const promises = children.map((child) =>
      createBoardTree(child.id, parentArray)
    );
    await Promise.all(promises);
  }
  return parentArray;
}

export default class Board implements FolderElement {
  id: number;

  title?: string | undefined;

  position?: number | undefined;

  project_id?: number | undefined;

  type?: 'board' | 'folder' | undefined;

  is_deleted?: number | undefined;

  updated_at?: string | undefined;

  created_at?: string | undefined;

  bookmarked?: boolean;

  constructor(data: FolderElement) {
    Object.assign(this, data);
    this.isBookmarked();
  }

  // 直系のページ取得
  async pages(): Promise<PageElement[]> {
    const result = await window.electron.ipcRenderer.invoke('boardChildren', [
      this.id,
    ]);
    return result;
  }

  // 直系のフォルダ取得
  async boards() {
    const result = await childrenFolder(this.id);
    return result;
  }

  //
  async flattenPages() {
    const parentPageData = await this.pages();
    const childrenBoards = await createBoardTree(this.id);
    const ids = childrenBoards.map((item: FolderElement) => item.id);
    const childPagesData = await window.electron.ipcRenderer.invoke(
      'fetchAllPagesInFolder',
      ids
    );

    const pagesData = [...parentPageData, ...childPagesData];

    return pagesData;
  }

  async isBookmarked(): Promise<void> {
    const query: FetchRecordQuery<'bookmark'> = {
      table: 'bookmark',
      conditions: {
        target: 'folder',
        target_id: this.id,
      },
    };
    const result = await window.electron.ipcRenderer.invoke(
      'fetchRecord',
      query
    );

    if (result!) {
      this.bookmarked = false;
    }

    this.bookmarked = true;
  }

  async toggleBookmark() {
    if (this.bookmarked) {
      const query = {
        table: 'bookmark',
        conditions: {
          target: 'folder',
          target_id: this.id,
        },
      };
      window.electron.ipcRenderer.sendMessage('deleteRecord', query);
      this.bookmarked = false;
    } else {
      const query = {
        table: 'bookmark',
        columns: {
          target: 'folder',
          target_id: this.id,
          position: -1,
          project_id: this.project_id,
        },
      };
      await window.electron.ipcRenderer.invoke('insertRecord', query);
      this.bookmarked = true;
    }
  }
}
