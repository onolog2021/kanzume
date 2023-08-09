import { useContext, useState, useRef, useEffect } from 'react';
import {
  CurrentPageContext,
  ProjectContext,
} from 'renderer/components/Context';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, TextField } from '@mui/material';

function TabItem({ tab, index }) {
  const [project] = useContext(ProjectContext);
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const titleRef = useRef();
  const [title, setTitle] = useState<string>(tab.title);
  const { id } = tab;
  const [input, setInput] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: tab.tabId,
    data: { type: 'tab', itemId: id, index },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleActiveTab = (id: number) => {
    const value = { id, type: tab.type };
    setCurrentPage(value);
  };

  function handleClick() {
    setInput(true);
  }

  useEffect(() => {
    titleRef.current?.focus();
  }, [input]);

  async function saveTitle() {
    const newTitle = titleRef.current.value;
    await window.electron.ipcRenderer.sendMessage('changePageTitle', [
      id,
      newTitle,
    ]);
    await window.electron.ipcRenderer.sendMessage('updatePageList', project.id);
    setInput(false);
  }

  const Tab = (
    <li
      className={currentPage.id === id ? 'selected' : null}
      onClick={() => handleActiveTab(id)}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {title}
      <button onClick={handleClick}>＋</button>
    </li>
  );

  const TitleInput = (
    <TextField
      inputRef={titleRef}
      size="small"
      value={title}
      onBlur={saveTitle}
      onChange={(e) => {
        setTitle(e.target.value);
      }}
    />
  );

  return input ? TitleInput : Tab;
}

export default TabItem;
