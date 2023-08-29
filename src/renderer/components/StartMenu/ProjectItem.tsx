import { ListItemButton, ListItemText } from '@mui/material';
import { dateTranslateForYYMMDD } from '../GlobalMethods';

function ProjectItem({ project, handleClick }) {
  const createdDate = new Date(project.created_at);
  const date = dateTranslateForYYMMDD(createdDate);

  return (
    <ListItemButton onClick={() => handleClick(project.id)}>
      <ListItemText
        primary={project.title}
        secondary={`最終更新：${date}`}
        secondaryTypographyProps={{ fontSize: 14 }}
      />
    </ListItemButton>
  );
}

export default ProjectItem;
