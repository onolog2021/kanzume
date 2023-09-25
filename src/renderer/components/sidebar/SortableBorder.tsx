import { useDroppable } from '@dnd-kit/core';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import theme from 'renderer/theme';

interface itemData {
  dndId: string;
  type: string;
  id: number;
  area: string;
  parentId: number;
  orderArray: string[];
  position: number;
  itemType: 'border' | 'item';
}

export default function SortableBorder({ tag, index }) {
  const [itemId, setItemId] = useState<string>('');
  const [itemData, setItemData] = useState<itemData>();

  useEffect(() => {
    const modifiedData = {
      ...tag.data,
      position: index,
      itemType: 'border',
    };
    const setId = `border-${modifiedData.area}-${tag.data.id}-${index}`;
    setItemId(setId);
    setItemData(modifiedData);
  }, [tag, index]);

  const { setNodeRef, isOver } = useDroppable({
    id: itemId,
    data: itemData,
  });

  const style = {
    height: 18,
    // transition: 'border-color 3s ease',
  };

  const overedStyle = {
    height: 9,
    mb: '9px',
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    // transition: 'border-color 3s ease',
  };

  return <Box ref={setNodeRef} sx={isOver ? overedStyle : style} />;
}
