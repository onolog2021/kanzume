import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DndContext, useSensors, useSensor, MouseSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import WorkSpace from './components/workspace/WorkSpace';
import SideBar from './components/sidebar/Sidebar';
import { ProjectContext, TabListContext } from './components/Context';
import BoardList from './components/sidebar/Board/BoardList';
import PageList from './components/sidebar/PageList/PageList';
import Project from './Classes/Project';
import QuickAccessArea from './components/sidebar/QuickAccess/QuickAccessArea';
import DragOverlayItem from './DragOverlayItem';
import { getCurrentTime } from './components/GlobalMethods';
import handleDataDroppedInBoardList from './DragAndDrop/handleDataDroppedInBoardList';
import handleDataDroppedInPageList from './DragAndDrop/handleDataDroppedInPageList';
import handleDataDroppedInQuickAccessArea from './DragAndDrop/handleDataDroppedInQuickAccessArea';
import handleDataDroppedInFolder from './DragAndDrop/handleDataDroppedInFolder';
import handleDataDroppedInBoardBody from './DragAndDrop/handleDataDroppedInBoardBody';
import softDeleteByDrop from './DragAndDrop/softDeleteByDrop';
import { DndTagDataElement } from '../types/renderElement';
import Node from './Classes/Node';

function DragAndDrop() {
  const projectId = useLocation().state?.project_id;
  const { project, setProject } = useContext(ProjectContext);
  const [activeItem, setActiveItem] = useState<DndTagDataElement>();
  const [overItem, setOverItem] = useState<DndTagDataElement>();
  const [pageRoot, setPageRoot] = useState<Node | undefined>();
  const [boards, setBoards] = useState([]);
  const [droppable, setDroppable] = useState<Boolean>(true);
  const timeId = useRef(null);
  const { tabList, setTabList } = useContext(TabListContext);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 20,
    },
  });
  const sensors = useSensors(mouseSensor);
  const quickAccessArea = <QuickAccessArea />;
  const boardList = <BoardList boards={boards} />;
  const pageList = <PageList root={pageRoot} />;

  useEffect(() => {
    async function fetchData() {
      const ProjectData = await fetchProjectData();
      await updatePageList(ProjectData);
      await updateBoardList(ProjectData);
    }
    fetchData();
  }, []);

  // 他コンポーネントからの更新要請の処理。
  useEffect(() => {
    window.electron.ipcRenderer.on('updatePageList', () => {
      if (project) {
        updatePageList(project);
      }
    });
    window.electron.ipcRenderer.on('updateBoardList', () => {
      if (project) {
        updateBoardList(project);
      }
    });
  }, [project]);

  async function fetchProjectData() {
    window.electron.ipcRenderer.sendMessage('checkProjectGit', projectId);
    try {
      const query = {
        table: 'project',
        conditions: { id: projectId },
      };
      const projectData = await window.electron.ipcRenderer.invoke(
        'fetchRecord',
        query
      );
      const currentProject = new Project(projectData);
      setProject(currentProject);
      const currentTime = getCurrentTime();
      query.columns = {
        updated_at: currentTime,
      };
      window.electron.ipcRenderer.invoke('updateRecord', query);
      return currentProject;
    } catch (error) {
      console.error(error);
    }
  }

  async function updatePageList(thisProject: Project) {
    const tree: Node = await thisProject.createTree();
    setPageRoot(tree);
  }

  async function updateBoardList(params: Project) {
    try {
      const result = await params.boards();
      setBoards(result);
    } catch (error) {
      console.log(error);
    }
  }

  function canDrop(over): Boolean {
    // 可能なエリアとタイプの組み合わせ
    const availableSet = {
      quickAccess: ['board', 'page'],
      pageList: ['page', 'board', 'folder', 'paper'],
      folder: ['page', 'board', 'folder', 'paper'],
      boardList: ['board', 'folder'],
      boardBody: ['page', 'paper'],
      tab: ['editor', 'board-tab', 'trash'],
      trash: ['page', 'folder', 'board', 'paper'],
    };
    if (activeItem.area === over) {
      return true;
    }
    return availableSet[`${over.area}`].includes(activeItem.type);
  }

  const DragStart = ({ active }) => {
    if (!active) {
      return;
    }

    const {
      type,
      id,
      area,
      parentId,
      orderArray,
      itemType,
      bookmark,
      content,
    } = active.data.current;
    const activeItemData = {
      dndId: active.id,
      type,
      id,
      area,
      index: active.data.current.index,
      parentId,
      orderArray,
      itemType,
      bookmark,
      content,
    };
    setActiveItem(activeItemData);
  };

  const DragOver = ({ over }) => {
    if (timeId.current !== null) {
      clearTimeout(timeId.current);
    }

    if (!over) {
      return;
    }
    const { type, id, area, parentId, orderArray, position, itemType } =
      over.data.current;
    const overItemData = {
      dndId: over.id,
      type,
      id,
      area,
      parentId,
      orderArray,
      position,
      itemType,
    };
    setOverItem(overItemData);

    const isDroppable = canDrop(overItemData);
    if (isDroppable) {
      setDroppable(true);
    } else {
      setDroppable(false);
    }

    if (type === 'folder') {
      const timeoutId = setTimeout(() => {
        timeId.current = null;
        window.electron.ipcRenderer.sendMessage('openFolder', overItemData.id);
      }, 1200);
      timeId.current = timeoutId;
    }
  };

  const dataFlowAfterDrop = {
    quickAccess: handleDataDroppedInQuickAccessArea,
    pageList: handleDataDroppedInPageList,
    folder: handleDataDroppedInFolder,
    boardList: handleDataDroppedInBoardList,
    boardBody: handleDataDroppedInBoardBody,
    trash: softDeleteByDrop,
  };

  const updateFlowAfterDrop = {
    quickAccess: 'updateQuickArea',
    pageList: 'updatePageList',
    folder: 'updatePageList',
    boardList: 'updateBoardList',
    boardBody: 'updateBoardBody',
  };

  const DragEnd = () => {
    // dropした場所は？
    const droppedPlace = overItem?.itemType;

    if (!droppable) {
      return;
    }
    if (activeItem?.dndId === overItem?.dndId) {
      return;
    }

    // ソート
    if (overItem?.area === 'tab') {
      const parentArray = overItem.orderArray;
      const oldIndex = parentArray.indexOf(activeItem?.dndId);
      const newIndex = parentArray.indexOf(overItem?.dndId);

      const newOrder = arrayMove(overItem.orderArray, oldIndex, newIndex);
      const tmpArray = [];
      newOrder.forEach((element) => {
        const matchTab = tabList.find((tab) => tab.tabId === element);
        tmpArray.push(matchTab);
      });
      setTabList(tmpArray);
    }

    if (
      droppedPlace === 'border' ||
      overItem.area === 'trash' ||
      overItem?.type === 'area'
    ) {
      const newOrder = overItem.type === 'area' ? [] : createNewOrderArray();
      // データの処理
      const areaFunction = dataFlowAfterDrop[overItem?.area];
      if (areaFunction) {
        areaFunction(newOrder, activeItem, overItem, project.id);
      }
    }

    if (droppedPlace === 'item') {
      if (overItem.type === 'folder' || overItem.type === 'board') {
        if (activeItem.type === 'folder' || activeItem.type === 'board') {
          const query = {
            table: 'folder',
            columns: {
              parent_id: overItem?.id,
              type: overItem?.type,
              position: -1,
            },
            conditions: {
              id: activeItem?.id,
            },
          };
          window.electron.ipcRenderer.invoke('updateRecord', query);
        } else {
          const query = {
            table: 'store',
            columns: {
              page_id: activeItem?.id,
              folder_id: overItem?.id,
              position: -1,
            },
          };
          window.electron.ipcRenderer.invoke('insertRecord', query);
        }
        if (activeItem?.parentId) {
          const deleteQuery = {
            table: 'store',
            conditions: {
              page_id: activeItem.id,
              folder_id: activeItem.parentId,
            },
          };
          window.electron.ipcRenderer.sendMessage('deleteRecord', deleteQuery);
        }
      }
    }

    // 関連箇所のデータ更新
    const updateDropArea = updateFlowAfterDrop[overItem?.area];
    const updateDragArea = updateFlowAfterDrop[activeItem?.area];
    if (updateDropArea) {
      window.electron.ipcRenderer.sendMessage('eventReply', updateDropArea);
    }
    if (updateDragArea && updateDropArea !== updateDragArea) {
      window.electron.ipcRenderer.sendMessage('eventReply', updateDragArea);
    }

    if (overItem?.area === 'trash') {
      removeTab();
    }

    if (
      tabList &&
      activeItem.type === 'board' &&
      tabList.some((item) => item.type === 'board' && item.id === activeItem.id)
    ) {
      removeTab();
    }
  };

  function removeTab() {
    const tabType = {
      page: 'editor',
      board: 'board',
    };
    const newTabList = [
      ...tabList.filter(
        (item) =>
          !(
            item.type === tabType[activeItem?.type] && item.id === activeItem.id
          )
      ),
    ];
    setTabList(newTabList);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={DragStart}
      onDragOver={DragOver}
      onDragEnd={DragEnd}
    >
      <div className="editorPage">
        <SideBar
          project_id={projectId}
          boardList={boardList}
          pageList={pageList}
          quickAccessArea={quickAccessArea}
        />
        <WorkSpace />
      </div>
      {activeItem && (
        <DragOverlayItem droppable={droppable} content={activeItem?.content} />
      )}
    </DndContext>
  );

  function createNewOrderArray() {
    // 同じ場所でドラッグ＆ドロップした場合
    if (activeItem.area === overItem.area) {
      const orderArray = [...overItem?.orderArray];
      const filteredArray = orderArray.filter(
        (item) => item !== activeItem?.dndId
      );
      filteredArray.splice(overItem.position, 0, activeItem?.dndId);
      return filteredArray;
    }
    // 違う場所でドラッグ＆ドロップした場合
    const orderArray = [...overItem?.orderArray];
    orderArray.splice(overItem?.position, 0, activeItem?.dndId);
    return orderArray;
  }
}

export default DragAndDrop;
