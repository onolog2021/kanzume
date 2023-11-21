interface StoreElement {
  id: number;
  folder_id: number;
  page_id: number;
  position: number;
}

interface BookmarkElement {
  id: number;
  target: 'page' | 'folder';
  target_id: number;
  position: number;
  project_id: number;
}

interface ProjectElement {
  id: number;
  title: string;
  created_at: string; // 日付型は通常はstringで表現されますが、Date型も検討してください
  updated_at: string; // 同上
  is_deleted: boolean;
}

// Folder interface
interface FolderElement {
  id: number;
  title?: string;
  position?: number;
  project_id?: number;
  type?: 'folder' | 'board';
  is_deleted?: number;
  updated_at?: string;
  created_at?: string;
}

// Page interface
interface PageElement {
  id: number;
  title: string;
  project_id: number;
  position: number;
  is_deleted: boolean;
  setting: string;
  updated_at: string;
  created_at: string;
}

export {
  StoreElement,
  BookmarkElement,
  ProjectElement,
  FolderElement,
  PageElement,
};
