import { Menu, MenuItem } from '@mui/material';

function ContextMenu({ contextMenu, onClose, menues }) {
  return (
    <Menu
      open={contextMenu !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      {menues &&
        menues.map((menu) => (
          <MenuItem onClick={menu.method} key={menu.id}>
            {menu.menuName}
          </MenuItem>
        ))}
    </Menu>
  );
}

export default ContextMenu;
