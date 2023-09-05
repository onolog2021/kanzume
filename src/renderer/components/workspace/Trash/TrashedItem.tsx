import { useContext } from 'react';
import {
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ContextMenu from 'renderer/components/ContextMenu';
import { ProjectContext } from 'renderer/components/Context';
import { ReactComponent as RollbackIcon } from '../../../../../assets/rollback.svg';
import { ReactComponent as PageIcon } from '../../../../../assets/paper.svg';
import { ReactComponent as BoardIcon } from '../../../../../assets/square.svg';
import { ReactComponent as FolderIcon } from '../../../../../assets/folder-outline.svg';

function TrashedItem({ item }) {
  const { id, title } = item;
  const [project] = useContext(ProjectContext);

  let icon;
  if (item.type) {
    icon = item.type === 'board' ? <BoardIcon /> : <FolderIcon />;
  } else {
    icon = <PageIcon />;
  }

  const rollBackItem = async () => {
    const query = {
      table: item.type ? 'folder' : 'page',
      columns: {
        is_deleted: false,
      },
      conditions: {
        id,
      },
    };
    await window.electron.ipcRenderer.sendMessage('updateRecord', query);
    await window.electron.ipcRenderer.sendMessage(
      'runUpdateTrashIndex',
      project.id
    );
    if (item.type === 'board') {
      window.electron.ipcRenderer.sendMessage('runUpdateBoardList');
    } else {
      window.electron.ipcRenderer.sendMessage('runUpdatePageList');
    }
  };

  return (
    <ListItemButton
      sx={{
        ':hover': {
          background: 'none',
          button: {
            display: 'block',
          },
        },
      }}
    >
      <IconButton
        onClick={rollBackItem}
        sx={{
          display: 'none',
          position: 'absolute',
          left: 0,
          width: 40,
          ':hover': {
            background: 'none',
          },
        }}
      >
        <RollbackIcon />
      </IconButton>
      <ListItemIcon
        sx={{
          py: 1,
          ml: '60px',
          minWidth: 40,
          svg: {
            width: 24,
          },
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText primary={title} secondary="test" />
    </ListItemButton>
  );
}

export default TrashedItem;
