import React, { useEffect, useState } from 'react';
import BoardSpace from './BoardSpace';
import {
  FetchRecordQuery,
  TabListElement,
} from '../../../../types/renderElement';
import { ColumnsContext, ColumnsStateElement } from '../../Context';
import { FolderElement } from '../../../../types/sqlElement';

export default function BoardProvider({ tab }: { tab: TabListElement }) {
  const [board, setBoard] = useState<FolderElement>();
  const [columnsState, setColumnsState] = useState<ColumnsStateElement>({
    fullWidth: 0,
    columns: 1,
  });

  // 初期設定
  useEffect(() => {
    async function fetchBoardData() {
      const query: FetchRecordQuery<'folder'> = {
        table: 'folder',
        conditions: {
          id: tab.id,
        },
      };
      const data = await window.electron.ipcRenderer.invoke(
        'fetchRecord',
        query
      );

      setBoard(data);
    }

    fetchBoardData();
  }, [tab]);

  return (
    <ColumnsContext.Provider value={[columnsState, setColumnsState]}>
      <BoardSpace boardData={tab} />
    </ColumnsContext.Provider>
  );
}
