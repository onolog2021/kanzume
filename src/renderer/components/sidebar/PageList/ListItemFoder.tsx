import { useContext, useState, useEffect } from 'react';
import { ListItemText, Collapse, ListItemButton, Button } from '@mui/material';
import Folder from 'renderer/Classes/Folder';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { ProjectContext } from '../../Context';
import TreeBranch from './TreeBranch';
import { ReactComponent as OpenFolder } from '../../../../../assets/folder-fill.svg';
import { ReactComponent as ClosedFolder } from '../../../../../assets/folder-outline.svg';

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
        {open ? (
          <OpenFolder className="sidebarItemIcon open" />
        ) : (
          <ClosedFolder className="sidebarItemIcon" />
        )}
        <ListItemText primary={folder.title} />
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit sx={{ pl: 2 }}>
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
