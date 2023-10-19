import {
  Box,
  Button,
  ListItemButton,
  ListItemIcon,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import theme from 'renderer/theme';
import HIstoryTree from './HIstoryTree';
import HistoryPreviewWindow from './HistoryPreviewWindow';
import { ReactComponent as PenIcon } from '../../../../../../assets/pen.svg';

export default function HistorySpace({ pageId, toggleStatus }) {
  const [selected, setSelected] = useState<string>('');

  const selectFunc = (hash: string) => {
    setSelected(hash);
  };

  return (
    <>
      <ListItemButton
        onClick={() => toggleStatus('editor')}
        sx={{ width: 'fit-content' }}
      >
        <ListItemIcon sx={{ minWidth: 24, mr: 1 }}>
          <PenIcon width={24} height={24} />
        </ListItemIcon>
        <Typography sx={{ lineHeight: '24px' }}>エディタにもどる</Typography>
      </ListItemButton>
      <Box
        sx={{
          display: 'grid',
          maxWidth: '100%',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'start',
        }}
      >
        <HIstoryTree
          pageId={pageId}
          selectFunc={selectFunc}
          selected={selected}
        />
        <HistoryPreviewWindow
          pageId={pageId}
          log={selected}
          toggleStatus={toggleStatus}
        />
      </Box>
    </>
  );
}
