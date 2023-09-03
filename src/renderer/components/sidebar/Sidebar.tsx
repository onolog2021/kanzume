import { useEffect, useContext } from 'react';
import { Drawer, Box } from '@mui/material';
import { ProjectContext } from '../Context';
import OpenTrashBoxButton from './TrashBox/OpenTrashBoxButton';

function SideBar({ project_id, pageList, boardList, quickAccessArea }) {
  const [project, setProject] = useContext(ProjectContext);

  if (!project) {
    return <h1>loading...</h1>;
  }

  return (
    <Drawer
      anchor="left"
      open
      variant="permanent"
      sx={{
        width: 240,
        position: 'relative',
        '& .MuiDrawer-paper': { width: 240, px: 1, minHeight: '100vh' },
        '& ::-webkit-scrollbar': {
          width: '2px',
        },
        '& ::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent',
        },
        '& :hover::-webkit-scrollbar-thumb': {
          backgroundColor: '#999',
        },
      }}
    >
      <Box sx={{ mb: '40px' }}>
        <h1>{project.title}</h1>
        {quickAccessArea}
        {pageList}
        {boardList}
      </Box>

      <OpenTrashBoxButton />
    </Drawer>
  );
}

export default SideBar;
