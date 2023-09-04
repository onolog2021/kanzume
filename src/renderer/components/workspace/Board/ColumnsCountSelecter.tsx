import { Box, Rating } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReactComponent as Rectangle } from '../../../../../assets/square.svg';

function ColumnsCountSelector({ changeColumnsCount }) {
  const itemStyle = {
    padding: 10,
  };

  return (
    <Box display="flex" gap={2}>
      <Rating
        name="columns-selecter"
        defaultValue={2}
        icon={<Rectangle style={{ height: 30, fill: 'tomato' }} />}
        emptyIcon={<Rectangle style={{ height: 30, fill: 'white' }} />}
      />
    </Box>
  );
}

export default ColumnsCountSelector;
