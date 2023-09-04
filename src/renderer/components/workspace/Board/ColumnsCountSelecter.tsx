import { Box, Rating, Typography } from '@mui/material';
import { ReactComponent as Rectangle } from '../../../../../assets/square.svg';
import { useState } from 'react';

function ColumnsCountSelector({ changeColumnsCount }) {
  const [count, setCount] = useState()

  const runChangeColumnsCount = (event, newValue) => {
    changeColumnsCount(newValue);
    setCount(newValue)
  };

  return (
    <Box display="flex" gap={2}>
      <Rating
        name="columns-selecter"
        defaultValue={2}
        icon={<Rectangle style={{ height: 30, fill: 'tomato' }} />}
        emptyIcon={<Rectangle style={{ height: 30, fill: 'white' }} />}
        onChange={runChangeColumnsCount}
      />
      <Typography>{count}列</Typography>
    </Box>
  );
}

export default ColumnsCountSelector;
