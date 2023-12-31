import { ListItemButton, ListItemText } from '@mui/material';
import { dateTranslateForYYMMDD } from '../GlobalMethods';

function ProjectItem({ project, handleClick }) {
  const openedDate = new Date(project.updated_at);
  const date = dateTranslateForYYMMDD(openedDate);

  return (
    <ListItemButton onClick={() => handleClick(project.id)}>
      <ListItemText
        primary={project.title}
        secondary={`最終：${date}`}
        secondaryTypographyProps={{ fontSize: 14 }}
      />
    </ListItemButton>
  );
}

export default ProjectItem;
