import { useContext, useEffect, useState } from 'react';
import { ListItemText, IconButton, ListItemButton } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Page from 'renderer/Classes/Page';
import {
  CurrentPageContext,
  TabListContext,
} from '../../Context';

function ListItemPage({ pageData, index }) {
  const page = new Page({ id: pageData.id, title: pageData.title });
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `page-${page.id}`,
      data: { area: 'page-list', type: 'page', itemId: page.id, index },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    color: currentPage === page.id ? 'tomato' : '#333',
  };

  const handleClick = () => {
    const value = {
      id: page.id,
      title: page.title,
      type: 'editor',
      tabId: `tab-editor-${page.id}`,
    };
    if (
      !tabList.some((item) => item.id === value.id && item.type === 'editor')
    ) {
      setTabList((prevTabs) => [...prevTabs, value]);
    }
    setCurrentPage({ id: page.id, type: 'editor' });
  };

  return (
    <ListItemButton
      onClick={() => handleClick()}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <ListItemText primary={page.title} />
    </ListItemButton>
  );
}

export default ListItemPage;
