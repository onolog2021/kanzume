import { ListItemButton } from '@mui/material';
import { dateTranslateForYYMMDD } from 'renderer/components/GlobalMethods';

export default function HistoryItem({ log, selectFunc }) {
  const commitDate = new Date(log.message);
  const date = dateTranslateForYYMMDD(commitDate);

  const setSelectedItem = () => {
    selectFunc(log);
  };

  return (
    <ListItemButton
      onClick={setSelectedItem}
      sx={{
        height: 48,
        ':before': {
          content: '""',
          backgroundColor: 'tomato',
          position: 'absolute',
          top: '50%',
          left: 0,
          width: 16,
          height: 16,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      {date}
    </ListItemButton>
  );
}
