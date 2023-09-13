import { Button, Box } from '@mui/material';
import { profile } from 'console';
import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import {
  editorTextToPlaneText,
  gitDiffParse,
  getDiff,
} from 'renderer/components/GlobalMethods';
import DifferenceOverlay from './DifferenceOverlay';
import PreviewText from './PreviewText';

export default function HistoryPreviewWindow({ pageId, log }) {
  const [project] = useContext(ProjectContext);
  const [logText, setLogText] = useState();
  const [diff, setDiff] = useState();
  const [diffText, setDiffText] = useState<[number, string]>([]);
  const [displayDiff, setDisplayDiff] = useState(false);

  useEffect(() => {
    async function fetchLogProfile() {
      const pageQuery = {
        table: 'page',
        conditions: {
          id: pageId,
        },
      };
      const pageData = await window.electron.ipcRenderer.invoke(
        'fetchRecord',
        pageQuery
      );
      const parsedtext = JSON.parse(pageData.content);
      const currentText = editorTextToPlaneText(parsedtext).join('\n');

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
      const planeText = text.join('');
      const diffArray = getDiff(planeText, currentText);
      setDiffText(diffArray);
      console.log(diffArray);
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

  const switchDisplayDiff = (boolean: Boolean) => {
    setDisplayDiff(boolean);
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 120px)',
        borderLeft: '1px solid #999',
        p: 4,
      }}
    >
      <Button onClick={rollBack}>ここに戻る</Button>
      <Button onClick={() => switchDisplayDiff(true)}>最新との比較</Button>
      {diffText && <PreviewText diffText={diffText} />}
      {displayDiff && (
        <DifferenceOverlay
          log={log}
          diff={diff}
          switchDisplsy={switchDisplayDiff}
        />
      )}
    </Box>
  );
}
