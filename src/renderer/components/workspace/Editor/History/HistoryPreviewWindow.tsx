import { Button } from '@mui/material';
import { profile } from 'console';
import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';

export default function HistoryPreviewWindow({ pageId, log }) {
  const [project] = useContext(ProjectContext);
  const [logProfile, setLotProfile] = useState();
  const [diff, setDiff] = useState();

  useEffect(() => {
    async function fetchLogProfile() {
      const query = {
        hash: log.hash,
        projectId: project.id,
        pageId,
      };
      const profile = await window.electron.ipcRenderer.invoke(
        'gitShow',
        query
      );
      const diffData = await window.electron.ipcRenderer.invoke(
        'gitDiff',
        query
      );
      setDiff(diffData);
      setLotProfile(profile);
    }

    if (log) {
      fetchLogProfile();
    }
  }, [log]);

  const rollBack = async () => {
    // 現在の状態をコミット
    await window.electron.ipcRenderer.invoke('commitPage', pageId);

    // 該当のハッシュへcheckout
    const query = {
      hash: log.hash,
      projectId: project.id,
      pageId,
    };
    await window.electron.ipcRenderer.invoke('gitCheckOut', query);

    // JSONの内容をページに読み込み
    const importQuery = {
      pageId,
      projectId: project.id,
    };

    window.electron.ipcRenderer.sendMessage('importText', importQuery);
  };

  return (
    <>
      {logProfile && (
        <>
          <h3>{logProfile}</h3>
          <p>{diff}</p>
          <Button onClick={rollBack}>ここに戻る</Button>
        </>
      )}
    </>
  );
}
