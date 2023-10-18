import { Button, Box, Tooltip,Typography } from '@mui/material';
import { profile } from 'console';
import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from 'renderer/components/Context';
import {
  editorTextToPlaneText,
  gitDiffParse,
  getDiff,
} from 'renderer/components/GlobalMethods';
import ReactLoading from 'react-loading';
import StyledScrollbarBox from 'renderer/GlobalComponent/StyledScrollbarBox';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import theme from 'renderer/theme';
import Confirmation from 'renderer/GlobalComponent/Confirmation';
import DifferenceOverlay from './DifferenceOverlay';
import PreviewText from './PreviewText';
import { ReactComponent as RollbackButton } from '../../../../../../assets/rollback.svg';
import { ReactComponent as CompareButton } from '../../../../../../assets/compare.svg';

export default function HistoryPreviewWindow({ pageId, log, toggleStatus }) {
  const [project] = useContext(ProjectContext);
  const [diffText, setDiffText] = useState<[number, string]>([]);
  const [loading, setLoading] = useState(false);
  const [overlayOn, setOverlayOn] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);

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
    setLoading(true);
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
    await window.electron.ipcRenderer.invoke('importText', importQuery);
    setLoading(false);
    toggleStatus('editor');
  };

  const switchOverlayOn = (boolean: Boolean) => {
    setOverlayOn(boolean);
  };

  const showConfirm = () => {
    setIsConfirm(true);
  };

  if (!log) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ textAlign: 'center' }}>
          選択されたアイテムはありません。
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <StyledScrollbarBox
        sx={{
          height: 'calc(100vh - 160px)',
          borderLeft: '1px solid #999',
          p: 4,
          px: 8,
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            background: 'white',
            right: 40,
            bottom: 20,
          }}
        >
          {loading && loading ? (
            <ReactLoading type="spin" color="gray" width={40} height={40} />
          ) : (
            <Tooltip title="このマーカーにロールバックする" placement="top">
              <PlaneIconButton onClick={showConfirm}>
                <RollbackButton
                  style={{
                    width: 24,
                    height: 24,
                    fill: theme.palette.primary.main,
                  }}
                />
              </PlaneIconButton>
            </Tooltip>
          )}
          <Tooltip title="最新と比較する" placement="top">
            <PlaneIconButton onClick={() => switchOverlayOn(true)}>
              <CompareButton
                style={{
                  width: 24,
                  height: 24,
                  fill: theme.palette.primary.main,
                }}
              />
            </PlaneIconButton>
          </Tooltip>
        </Box>
        {overlayOn && (
          <DifferenceOverlay
            switchDisplsy={switchOverlayOn}
            diffText={diffText}
          />
        )}
        {diffText && <PreviewText diffText={diffText} />}
      </StyledScrollbarBox>
      {isConfirm && (
        <Confirmation
          onclick={rollBack}
          text={
            '現在の内容をマークした上で、対象マーカーの内容に変更します。\n問題ありませんか？'
          }
          isOpen={isConfirm}
          closeConfirm={() => {
            setIsConfirm(false);
          }}
        />
      )}
    </>
  );
}
