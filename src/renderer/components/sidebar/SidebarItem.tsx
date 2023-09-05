import { ListItem, ListItemButton, Typography } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';

function SidebarItem({ icon, text, functions }) {
  const { click } = functions;
  // const { attributes, listeners, setNodeRef, transform, transition } =
  //   useSortable({
  //     id: `page-${pageData.id}`,
  //     data: { area: 'page-list', type: 'page', itemId: pageData.id, index },
  //   });

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  //   color: currentPage === pageData.id ? 'tomato' : '#333',
  // };

  return (
    <ListItemButton
      onClick={click}
      sx={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr',
        gap: 1,
        height: 40,
        alignItems: 'center',
        svg: {
          width: 16,
          margin: '0 auto',
        },
      }}
      // ref={setNodeRef}
      // style={style}
      // {...listeners}
      // {...attributes}
    >
      {icon}
      <Typography
        sx={{
          fontSize: 14,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 1,
          overflow: 'hidden',
          wordBreak: 'break-all',
        }}
      >
        {text}
      </Typography>
    </ListItemButton>
  );
}

export default SidebarItem;
