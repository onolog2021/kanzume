import { useContext, useEffect, useState } from 'react';
import { ListItemText, IconButton, ListItemButton } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Page from 'renderer/Classes/Page';
import { CurrentPageContext, TabListContext } from '../../Context';

function ListItemPage({ pageData, index }) {
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `page-${pageData.id}`,
      data: { area: 'page-list', type: 'page', itemId: pageData.id, index },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    color: currentPage === pageData.id ? 'tomato' : '#333',
  };

  const handleClick = () => {
    const value = {
      id: pageData.id,
      title: pageData.title,
      type: 'editor',
      tabId: `tab-editor-${pageData.id}`,
    };
    if (
      !tabList.some((item) => item.id === value.id && item.type === 'editor')
    ) {
      setTabList((prevTabs) => [...prevTabs, value]);
    }
    setCurrentPage({ id: pageData.id, type: 'editor' });
  };

  return (
    <ListItemButton
      onClick={() => handleClick()}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <ListItemText primary={pageData.title} />
    </ListItemButton>
  );
}

export default ListItemPage;
