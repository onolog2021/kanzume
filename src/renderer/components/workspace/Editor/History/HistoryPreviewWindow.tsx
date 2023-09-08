import { Button } from '@mui/material';
import { profile } from 'console';
import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import {
  editorTextToPlaneText,
  gitDiffParse,
} from 'renderer/components/GlobalMethods';

export default function HistoryPreviewWindow({ pageId, log }) {
  const [project] = useContext(ProjectContext);
  const [logText, setLogText] = useState();
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
      const translatedDiff = gitDiffParse(diffData);
      setDiff(translatedDiff);
      const json = JSON.parse(profile);
      const text = editorTextToPlaneText(json);
      setLogText(text);
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
      {logText && (
        <div>
          {logText.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      )}
      <p>{diff}</p>
      <Button onClick={rollBack}>ここに戻る</Button>
    </>
  );
}
