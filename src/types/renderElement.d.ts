export interface TabListElement {
  id: number;
  title: string;
  type: 'editor' | 'board';
  tabId: string;
}

type TableName = 'page' | 'folder' | 'project' | 'store' | 'bookmark';

type ColumnValueTypeByTable = {
  page?: {
    id?: number;
    title?: string;
    project_id?: number;
    content?: string | null;
    setting?: string | null;
    position?: number;
    is_deleted?: number;
    updated_at?: string | null;
    created_at?: string | null;
  };
  folder?: {
    id?: number;
    title: string;
    position?: number;
    project_id?: number;
    type: string;
    parent_id?: number | null;
    is_deleted?: number;
    updated_at?: string | null;
    created_at?: string | null;
  };
  project?: {
    id?: number;
    title?: string;
    created_at?: string;
    updated_at?: string | null;
    is_deleted?: number;
  };
  store?: {
    id?: number;
    folder_id?: number;
    page_id?: number;
    position?: number;
  };
  bookmark?: {
    id?: number;
    target: 'page' | 'folder';
    target_id: number;
    position?: number;
    project_id?: number;
  };
};

type ColumnsKeys<T extends TableName> = keyof ColumnValueTypeByTable[T];

export interface InsertRecordQuery<T extends TableName> {
  table: T;
  columns: ColumnValueTypeByTable[T];
}

export interface UpdateRecordQuery<T extends TableName> {
  table: T;
  columns: ColumnValueTypeByTable[T];
  conditions: ColumnValueTypeByTable[T];
}

export interface FetchRecordQuery<T extends TableName> {
  table: T;
  columns?: ColumnsKeys<T>[];
  conditions: ColumnValueTypeByTable[T];
}
