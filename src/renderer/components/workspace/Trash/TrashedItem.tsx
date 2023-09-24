import { useContext } from 'react';
import {
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import { ProjectContext } from 'renderer/components/Context';
import { dateTranslateForYYMMDD } from 'renderer/components/GlobalMethods';
import { ReactComponent as RollbackIcon } from '../../../../../assets/rollback.svg';
import { ReactComponent as PageIcon } from '../../../../../assets/paper.svg';
import { ReactComponent as BoardIcon } from '../../../../../assets/square.svg';
import { ReactComponent as FolderIcon } from '../../../../../assets/folder-outline.svg';
import { ReactComponent as TrashButton } from '../../../../../assets/trash.svg';

function TrashedItem({ item, setSelectedItem }) {
  const { id, title } = item;
  const [project] = useContext(ProjectContext);

  let icon;
  if (item.type) {
    icon = item.type === 'board' ? <BoardIcon /> : <FolderIcon />;
  } else {
    icon = <PageIcon />;
  }

  const rollBackItem = async (event) => {
    setSelectedItem(null);
    const query = {
      table: item.type ? 'folder' : 'page',
      columns: {
        is_deleted: false,
      },
      conditions: {
        id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
    window.electron.ipcRenderer.sendMessage('runUpdateTrashIndex', project.id);
    if (item.type === 'board') {
      window.electron.ipcRenderer.sendMessage('runUpdateBoardList');
    } else {
      window.electron.ipcRenderer.sendMessage('runUpdatePageList');
    }
  };

  const showPreview = () => {
    if (!item.type) {
      const type = 'page';
      const data = { id: item.id };
      const itemData = { type, data };
      setSelectedItem(itemData);
    }
  };

  const deletedTime = new Date(item.updated_at);
  const displayTime = dateTranslateForYYMMDD(deletedTime);

  const deleteItem = () => {
    const deleteQuery = {
      table: item.type ? 'folder' : 'page',
      conditions: {
        id,
      },
    }
    window.electron.ipcRenderer.sendMessage('deleteRecord', deleteQuery);
    window.electron.ipcRenderer.sendMessage('runUpdateTrashIndex');
  }

  return (
    <ListItemButton onClick={showPreview}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title="もとに戻す" placement="top">
          <IconButton onClick={rollBackItem}>
            <RollbackIcon style={{ width: 24, height: 24 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="完全に削除する" placement="top">
          <IconButton onClick={deleteItem}>
            <TrashButton style={{ width: 24, height: 24 }} />
          </IconButton>
        </Tooltip>
      </Box>

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
      <ListItemText primary={title} secondary={displayTime} />
    </ListItemButton>
  );
}

export default TrashedItem;
