import React, { useEffect, useState } from 'react';
import BoardSpace from './BoardSpace';
import {
  FetchRecordQuery,
  TabListElement,
} from '../../../../types/renderElement';
import { ColumnsStateProvider } from '../../Context';
import { FolderElement } from '../../../../types/sqlElement';

export default function BoardProvider({ tab }: { tab: TabListElement }) {
  const [board, setBoard] = useState<FolderElement>();

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

  if (board === undefined) {
    return <p>load</p>;
  }

  return (
    <ColumnsStateProvider>
      <BoardSpace boardData={board} />
    </ColumnsStateProvider>
  );
}
