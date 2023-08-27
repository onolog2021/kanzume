import { useContext, useState, useEffect } from 'react';
import {
  List,
  ListItemText,
  IconButton,
  Collapse,
  ListItemButton,
  Button,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import Folder from 'renderer/Classes/Folder';
import { CSS } from '@dnd-kit/utilities';
import Node from 'renderer/Classes/Node';
import { useSortable } from '@dnd-kit/sortable';
import { ProjectContext } from '../../Context';
import ListItemPage from './ListItemPage';
import TreeBranch from './TreeBranch';

function ListItemFolder({ folderData, index }) {
  const folder = new Folder(folderData);
  const [project, setProject] = useContext(ProjectContext);
  const [open, setOpen] = useState(false);
  const [hasPage, setHasPage] = useState([]);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `folder-${folder.id}`,
      data: { area: 'page-list', type: 'folder', itemId: folder.id, index },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    setOpen(!open);
  };

  useEffect(() => {
    getPages();
  }, []);

  async function getPages() {
    const pages = await folder.pages();
    setHasPage(pages);
  }

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
      >
        <IconButton edge="start" aria-label="delete">
          <DeleteIcon />
        </IconButton>
        <ListItemText primary={folder.title} />
        {hasPage.length !== 0 ? open ? <ExpandLess /> : <ExpandMore /> : null}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {folderData.children && (
          <>
            <TreeBranch parentNode={folderData} />
            <Button
              onClick={() => {
                mergeChildrenText(folderData.children);
              }}
            >
              結合する
            </Button>
          </>
        )}
      </Collapse>
    </>
  );

  function mergeChildrenText(children) {
    // childrenのテキストデータ取得
    const pageIdArray = children.map((childNode) => childNode.id);
    const query = {
      folderName: folderData.title,
      pageIdArray,
      projectId: project.id,
    };
    window.electron.ipcRenderer.sendMessage('mergeTextData', query);
  }
}

export default ListItemFolder;
