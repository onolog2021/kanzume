import { useEffect, useState } from 'react';
import { SortableContext } from '@dnd-kit/sortable';
import Node from 'renderer/Classes/Node';
import NowLoading from 'renderer/GlobalComponent/NowLoading';
import ListItemFolder from './ListItemFoder';
import ListItemPage from './ListItemPage';

export default function TreeBranch({ parentNode }) {
  const { children } = parentNode;
  const [items, setItems] = useState([]);
  const [parentId, setParentId] = useState<number>();

  if (!parentNode) {
    return <NowLoading loading />;
  }

  useEffect(() => {
    if (parentNode.type === 'folder') {
      setParentId(parentNode.id);
    }
  }, []);

  useEffect(() => {
    if (children) {
      setItems(parentNode.createOrderArrayForDndTag());
    }
  }, [children]);

  return (
    <div className={`folder-${parentId}`}>
      <SortableContext items={items}>
        {children &&
          children.map((item, index) =>
            item.type === 'folder' ? (
              <ListItemFolder
                key={index}
                folderData={item}
                orderArray={items}
                parentId={parentId}
              />
            ) : (
              <ListItemPage
                key={index}
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
