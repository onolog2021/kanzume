import { useContext, useState, useEffect } from 'react';
import {
  TabListContext,
  CurrentPageContext,
} from 'renderer/components/Context';
import { Button, Tab } from '@mui/material';
import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import EditorBody from './EditorBody';
import TabList from '../TabList';

function TabSet() {
  const [currentPage, setCurrentPage] = useContext(CurrentPageContext);

  const [tabList, setTabList] = useContext(TabListContext);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 20,
    },
  });
  const sensors = useSensors(mouseSensor);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const ary = tabList.map((ele) => {
      return ele.id.toString();
    });
    setItems(ary);
  }, [tabList]);

  const handleActiveTab = (id: number) => {
    setCurrentPage(id);
  };

  if (tabList.length === 0) {
    return <h1>まだテキストがありません</h1>;
  }

  return (
    <>
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <ul className="editorTabList">
          {tabList.map((page) => (
            <TabList key={page.id} page={page} />
          ))}
        </ul>
      </SortableContext>

      <h6 id="textCounter" />
      {tabList.map((page) => (
        <div
          key={page.id}
          className="tabBody"
          style={{ display: currentPage === page.id ? 'block' : 'none' }}
        >
          <EditorBody
            key={page.id}
            targetId={`page-${page.id}`}
            page_id={page.id}
          />
        </div>
      ))}
    </>
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const oldIndex = tabList.findIndex(
        (page) => page.id.toString() === active.id
      );
      const newIndex = tabList.findIndex(
        (page) => page.id.toString() === over.id
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        const newPageList = arrayMove(tabList, oldIndex, newIndex);
        const newItems = newPageList.map((obj) => obj.id.toString());
        setItems(newItems);
        setTabList(newPageList);
      }
    }
  }
}

export default TabSet;
