import { ListItemButton, ListItemText } from '@mui/material';

function ProjectItem({ project, handleClick }) {
  return (
    <ListItemButton
      onClick={() => handleClick(project.id)}
      sx={{ borderLeft: 1, mb: 1, py: 1 }}
    >
      <ListItemText
        primary={project.title}
        secondary={`最終更新：${project.created_at}`}
      />
    </ListItemButton>
  );
}

export default ProjectItem;
