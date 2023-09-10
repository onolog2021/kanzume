import { useEffect, useState } from 'react';
import { SortableContext } from '@dnd-kit/sortable';
import Node from 'renderer/Classes/Node';
import ListItemFolder from './ListItemFoder';
import ListItemPage from './ListItemPage';

export default function TreeBranch({ parentNode, parentId }) {
  const { children } = parentNode;
  const [items, setItems] = useState([]);

  if (!parentNode) {
    return <p>Now Loading...</p>;
  }

  useEffect(() => {
    if (children) {
      setItems(parentNode.createOrderArrayForDndTag());
    }
  }, [children]);

  return (
    <div>
      <SortableContext items={items}>
        {children &&
          children.map((item) =>
            item.type === 'folder' ? (
              <ListItemFolder
                key={`folder-${item.id}`}
                folderData={item}
                orderArray={items}
                parentId={parentId}
              />
            ) : (
              <ListItemPage
                key={`page-${item.id}`}
                pageData={item}
                orderArray={items}
                parentId={parentId}
                bookmark={false}
              />
            )
          )}
      </SortableContext>
    </div>
  );
}
