import { Button, Box } from '@mui/material';
import { profile } from 'console';
import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import {
  editorTextToPlaneText,
  gitDiffParse,
  getDiff,
} from 'renderer/components/GlobalMethods';
import ReactLoading from 'react-loading';
import DifferenceOverlay from './DifferenceOverlay';
import PreviewText from './PreviewText';

export default function HistoryPreviewWindow({ pageId, log, toggleStatus }) {
  const [project] = useContext(ProjectContext);
  const [diffText, setDiffText] = useState<[number, string]>([]);
  const [loading, setLoading] = useState(false);

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
      const currentText = editorTextToPlaneText(parsedtext);

      const query = {
        hash: log.hash,
        projectId: project.id,
        pageId,
      };
      const profile = await window.electron.ipcRenderer.invoke(
        'gitShow',
        query
      );
      const json = JSON.parse(profile);
      const oldText = editorTextToPlaneText(json);
      const diffArray = getDiff(oldText, currentText);
      setDiffText(diffArray);
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
    toggleStatus('editor');
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 120px)',
        borderLeft: '1px solid #999',
        p: 4,
      }}
    >
      {loading && loading ? (
        <ReactLoading type="spin" color="gray" width={40} height={40} />
      ) : (
        <Button onClick={rollBack}>ロールバックする</Button>
      )}
      {diffText && <PreviewText diffText={diffText} />}
    </Box>
  );
}
