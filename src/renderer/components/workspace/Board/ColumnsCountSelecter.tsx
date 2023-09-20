import { Box, Rating, Typography } from '@mui/material';
import { useState } from 'react';
import { ReactComponent as Rectangle } from '../../../../../assets/rectangle.svg';

function ColumnsCountSelector({ changeColumnsCount, pages }) {
  const [count, setCount] = useState();

  const runChangeColumnsCount = async (event, newValue) => {
    changeColumnsCount(newValue);
    setCount(newValue);

    const newWidth = `${(1 / newValue) * 100}%`;
    const queryArray = [];
    pages.forEach((page) => {
      const oldSetting = JSON.parse(page.setting);
      const newSetting = {
        ...oldSetting,
        width: newWidth,
      };
      const query = {
        table: 'page',
        columns: {
          setting: JSON.stringify(newSetting),
        },
        conditions: {
          id: page.id,
        },
      };
      queryArray.push(query);
    });
    await window.electron.ipcRenderer.invoke('updateRecords', queryArray);
  };

  return (
    <Box display="flex" gap={2}>
      <Rating
        name="columns-selecter"
        defaultValue={3}
        icon={
          <Rectangle
            style={{
              width: 30,
              margin: 3,
              fill: '#888',
            }}
          />
        }
        emptyIcon={<Rectangle style={{ width: 30, fill: '#D9D9D9', margin: 3 }} />}
        onChange={runChangeColumnsCount}
      />
      <Typography>{count}列</Typography>
    </Box>
  );
}

export default ColumnsCountSelector;
