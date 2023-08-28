import { List, ListItem, ListItemButton, Typography } from '@mui/material';
import ContextMenu from 'renderer/components/ContextMenu';

function TrashedItem({ item }) {
  const { id, title } = item;

  const rollBackItem = () => {
    const query = {
      table: item.type ? 'folder' : 'page',
      columns: {
        is_deleted: 0,
      },
      conditions: {
        id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  };

  return (
    <ListItemButton onClick={rollBackItem}>
      <Typography>{title}</Typography>
    </ListItemButton>
  );
}

export default TrashedItem;
