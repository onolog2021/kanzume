import { Box, ListItemIcon, Typography } from '@mui/material';

function CategoryTitle({ svg, categoryName }) {
  return (
    <Box display="flex" alignItems="center" sx={{ mt: 3, mb: 1 }}>
      {svg}
      <Typography fontWeight="bold" sx={{ ml: 1, pt: 0.4 }}>
        {categoryName}
      </Typography>
    </Box>
  );
}

export default CategoryTitle;
