import { useState, useEffect } from 'react';
import { ListItemButton } from '@mui/material';
import { dateTranslateForYYMMDD } from 'renderer/components/GlobalMethods';

export default function HistoryItem({ log, selectFunc, selected }) {
  const [isSelected, setIsSelected] = useState(false);

  const commitDate = new Date(log.message);
  const date = dateTranslateForYYMMDD(commitDate);

  useEffect(() => {
    if (selected.hash === log.hash) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  }, [selected]);

  const setSelectedItem = () => {
    selectFunc(log);
  };

  return (
    <ListItemButton
      disableRipple
      disableTouchRipple
      onClick={setSelectedItem}
      sx={{
        height: 48,
        pl: 3,
        mb: 4,
        fontSize: 18,
        textDecoration: isSelected ? 'underline' : 'none',
        textUnderlineOffset: 8,
        ':hover': {
          background: 'transparent',
          textDecoration: isSelected ? 'underline' : 'none',
        },
        ':before': {
          content: '""',
          backgroundColor: isSelected ? '#6B9EBB' : '#D9D9D9',
          position: 'absolute',
          top: '50%',
          left: 0,
          width: isSelected ? 24 : 16,
          height: isSelected ? 24 : 16,
          transition: 'width .1s .1s, height .1s .1s',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      {date}
    </ListItemButton>
  );
}
