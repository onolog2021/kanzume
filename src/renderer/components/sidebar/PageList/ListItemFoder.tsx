import { useContext, useState, useEffect } from 'react';
import {
  ListItemText,
  Collapse,
  ListItemButton,
  Button,
  Typography,
} from '@mui/material';
import Folder from 'renderer/Classes/Folder';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Rotate90DegreesCcw } from '@mui/icons-material';
import { ProjectContext } from '../../Context';
import TreeBranch from './TreeBranch';
import { ReactComponent as ClosedFolder } from '../../../../../assets/folder-fill.svg';
import { ReactComponent as OpenFolder } from '../../../../../assets/folder-outline.svg';
import { ReactComponent as MergePages } from '../../../../../assets/papers.svg';
import { ReactComponent as Expand } from '../../../../../assets/expand.svg';

function ListItemFolder({ folderData, index }) {
  const { children } = folderData;
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

  const childrenTypeArray = Object.values(children);

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
        <Expand
          style={
            open
              ? { transform: 'rotate(0deg)' }
              : { transform: 'rotate(-90deg)' }
          }
        />
        <ListItemText primary={folder.title} />
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit sx={{ pl: 1 }}>
        {children && children.length > 0 && (
          <TreeBranch parentNode={folderData} />
        )}
      </Collapse>
      {/* {open && childrenTypeArray.includes('folder') ? null : (
        <Button
          sx={{ ml: 1 }}
          onClick={() => {
            mergeChildrenText(children);
          }}
        >
          <MergePages style={{ width: 12 }} />
          <Typography color="#333" sx={{ fontSize: 13, mt: 0.5, ml: 1 }}>
            結合する
          </Typography>
        </Button>
      )} */}
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
