import { Box, ListItemIcon, Typography } from '@mui/material';

function CategoryTitle({ svg, categoryName }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{ mr: 'auto', svg: { width: 18, height: 18 } }}
    >
      {svg}
      <Typography fontWeight="bold" sx={{ ml: 1, pt: 0.4, fontSize: 16 }}>
        {categoryName}
      </Typography>
    </Box>
  );
}

export default CategoryTitle;
