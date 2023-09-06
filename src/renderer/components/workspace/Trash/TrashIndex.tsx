import { Box } from '@mui/material';
import TrashedItem from './TrashedItem';

export default function TrashIndex({ items, click }) {
  function createKey(type, id) {
    const key = type ? `${type}-${id}` : `page-${id}`;
    return key;
  }

  return (
    <Box>
      {items &&
        items.map((item) => (
          <TrashedItem
            key={createKey(item.type, item.id)}
            item={item}
            setSelectedItem={click}
          />
        ))}
    </Box>
  );
}
