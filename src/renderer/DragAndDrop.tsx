import { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import WorkSpace from './components/workspace/WorkSpace';
import SideBar from './components/sidebar/Sidebar';
import { ProjectContext, TabListContext } from './components/Context';
import BoardList from './components/sidebar/Board/BoardList';
import PageList from './components/sidebar/PageList/PageList';
import Project from './Classes/Project';
import { collectNames } from './components/GlobalMethods';
import TabList from './components/workspace/TabList';
import QuickAccessArea from './components/sidebar/QuickAccess/QuickAccessArea';

interface itemData {
  dndId: string;
  type: string;
  id: number;
  area: string;
  index: any;
  parentId: number;
  orderArray: string[];
}

function DragAndDrop() {
  const projectId = useLocation().state?.project_id;
  const [project, setProject] = useContext(ProjectContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [activeItem, setActiveItem] = useState<itemData>();
  const [overItem, setOverItem] = useState<itemData>();
  const [boardIndex, setBoardIndex] = useState([]);
  const [pageIndex, setPageIndex] = useState();
  const [pageRoot, setPageRoot] = useState();
  const [boards, setBoards] = useState([]);
  const [droppable, setDroppable] = useState<Boolean>(true);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 20,
    },
  });
  const sensors = useSensors(mouseSensor);
  const quickAccessArea = <QuickAccessArea />;
  const boardList = <BoardList boards={boards} />;
  const pageList = <PageList root={pageRoot} />;
  // const tabs = <TabList  />;

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
      const currentTime = new Date();
      query.columns = {
        updated_at: currentTime.toString(),
      };
      window.electron.ipcRenderer.sendMessage('updateRecord', query);
      return currentProject;
    } catch (error) {
      console.error(error);
    }
  }

  async function updatePageList(thisProject: Project) {
    const tree: Node = await thisProject.createTree();
    setPageRoot(tree);
    const itemsData = collectNames(tree);
    const newary = itemsData.map(
      (nodeItem) => `${nodeItem.type}-${nodeItem.id}`
    );
    const newIndex = newary.filter((item) => !item.startsWith('project'));
    setPageIndex(newIndex);
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

    const { type, id, area, parentId, orderArray } = active.data.current;
    const activeItemData = {
      dndId: active.id,
      type,
      id,
      area,
      index: active.data.current.index,
      parentId,
      orderArray,
    };
    setActiveItem(activeItemData);
  };

  const DragOver = ({ over }) => {
    if (!over) {
      return;
    }
    const { type, id, area, parentId, orderArray } = over.data.current;
    const overItemData = {
      dndId: over.id,
      type,
      id,
      area,
      parentId,
      orderArray,
    };
    setOverItem(overItemData);

    const isDroppable = canDrop(overItemData);
    if (isDroppable) {
      setDroppable(true);
    } else {
      setDroppable(false);
    }
  };

  const dataFlowAfterDrop = {
    quickAccess: handleDataDroppedInQuickAccessArea,
    pageList: handleDataDroppedInPageList,
    folder: handleDataDroppedInFolder,
    boardList: ['board', 'folder'],
    boardBody: ['page', 'paper'],
    tab: ['editor', 'board-tab', 'trash'],
  };

  const DragEnd = () => {
    if (!droppable) {
      return;
    }
    // 新しい順番の作成
    const newOrder = createNewOrderArray();
    // データの処理
    const areaFunction = dataFlowAfterDrop[overItem?.area];
    if (areaFunction) {
      areaFunction(newOrder);
    }
    // 関連箇所のデータ更新
  };

  // クイックアクセスのデータ処理
  async function handleDataDroppedInQuickAccessArea(order: string[]) {
    if (activeItem?.area !== overItem.area) {
      const target = overItem.type === 'page' ? 'page' : 'folder';
      const position = order.indexOf(activeItem?.dndId);
      const query = {
        table: 'bookmark',
        columns: {
          position,
          target,
          target_id: activeItem?.id,
          project_id: project.id,
        },
      };
      await window.electron.ipcRenderer.invoke('insertRecord', query);
    }

    const queryArgs = [];
    order.forEach((element, index) => {
      const hash = element.split('-');
      const targetHash = ['qp', 'qb'];
      if (targetHash.includes(hash[0])) {
        const target = hash[0] === 'qp' ? 'page' : 'folder';
        const bookmarkQuery = {
          table: 'bookmark',
          columns: {
            position: index,
          },
          conditions: {
            target,
            target_id: parseInt(hash[1]),
          },
        };
        queryArgs.push(bookmarkQuery);
      }
    });
    await window.electron.ipcRenderer.invoke('updateRecords', queryArgs);
  }

  async function handleDataDroppedInPageList(order: string[]) {
    if (activeItem.type === 'paper') {
      const deleteStoreQuery = {
        table: 'store',
        conditions: {
          page_id: activeItem?.id,
          folder_id: activeItem?.parentId,
        },
      };
      window.electron.ipcRenderer.sendMessage('deleteRecord', deleteStoreQuery);

      const position = order.indexOf(activeItem?.dndId);
      const updatePaperQuery = {
        table: 'page',
        columns: {
          position,
        },
        conditions: {
          id: activeItem?.id,
        },
      };
      window.electron.ipcRenderer.sendMessage('updateRecord', updatePaperQuery);
    }

    if (activeItem.type === 'board') {
      const position = order.indexOf(activeItem?.dndId);
      const updateFolderQuery = {
        table: 'folder',
        columns: {
          type: 'folder',
          position,
        },
        conditions: {
          id: activeItem?.id,
        },
      };
      window.electron.ipcRenderer.sendMessage(
        'updateRecord',
        updateFolderQuery
      );

      const deleteBookmarkQuery = {
        table: 'bookmark',
        conditions: {
          target: 'folder',
          target_id: activeItem?.id,
        },
      };
      window.electron.ipcRenderer.sendMessage(
        'deleteRecord',
        deleteBookmarkQuery
      );
    }

    const argsArray = [];
    const targetType = ['p', 'f'];
    order.forEach((element, index) => {
      const hash = element.split('-');
      if (targetType.includes(element.charAt(0))) {
        const query = {
          table: element.charAt(0) === 'p' ? 'page' : 'folder',
          columns: {
            position: index,
          },
          conditions: {
            id: parseInt(hash[1]),
          },
        };
        argsArray.push(query);
      }
    });
    window.electron.ipcRenderer.invoke('updateRecords', argsArray);
  }

  async function handleDataDroppedInFolder(order: string[]) {
    if (activeItem.type === 'paper') {
      const position = order.indexOf(activeItem?.dndId);
      const query = {
        table: 'store',
        columns: {
          position,
          folder_id: overItem?.parentId,
        },
        conditions: {
          page_id: activeItem?.id,
          folder_id: activeItem?.parentId,
        },
      };
      window.electron.ipcRenderer.sendMessage('updateRecord', query);
    }

    if (activeItem.type === 'board') {
      const position = order.indexOf(activeItem?.dndId);
      const query = {
        table: 'folder',
        columns: {
          position,
          parent_id: overItem?.parentId,
          type: 'folder',
        },
        conditions: {
          id: activeItem?.id,
        },
      };
      window.electron.ipcRenderer.sendMessage('updateRecord', query);
      const deleteBookmarkQuery = {
        table: 'bookmark',
        conditions: {
          target: 'folder',
          target_id: activeItem?.id,
        },
      };
      window.electron.ipcRenderer.sendMessage(
        'deleteRecord',
        deleteBookmarkQuery
      );
    }

    const argsArray = [];
    const targetType = ['p', 'f'];
    order.forEach((element, index) => {
      if (targetType.includes(element.charAt(0))) {
        const hash = element.split('-');

        if (hash[0] === 'p') {
          const query = {
            table: 'store',
            columns: {
              position: index,
            },
            conditions: {
              folder_id: overItem?.parentId,
              page_id: parseInt(hash[1]),
            },
          };
          argsArray.push(query);
        } else {
          const query = {
            table: 'folder',
            columns: {
              position: index,
              parent_id: overItem?.parentId,
            },
            conditions: {
              id: parseInt(hash[1]),
            },
          };
          argsArray.push(query);
        }
      }
    });
    console.log(argsArray)
    window.electron.ipcRenderer.invoke('updateRecords', argsArray);
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
      <DragOverlay style={{ zIndex: 1200 }}>
        {droppable ? <p>OK</p> : <p>NO</p>}
      </DragOverlay>
    </DndContext>
  );

  function createNewOrderArray() {
    // 同じ場所でドラッグ＆ドロップした場合
    if (activeItem.area === overItem.area) {
      if (activeItem?.dndId !== overItem.dndId) {
        const oldOrderArray = overItem?.orderArray;
        const oldIndex = oldOrderArray.indexOf(activeItem?.dndId);
        const newIndex = oldOrderArray.indexOf(overItem?.dndId);

        return arrayMove(oldOrderArray, oldIndex, newIndex);
      }
    } else {
      // 違う場所でドラッグ＆ドロップした場合
      const addedArray = [...overItem?.orderArray, activeItem?.dndId];
      const oldIndex = addedArray.indexOf(activeItem?.dndId);
      const newIndex = addedArray.indexOf(overItem?.dndId);
      return arrayMove(addedArray, oldIndex, newIndex);
    }
  }

  // 引数にあわせて更新する
  function updateList(area) {
    // boardの場合、どれを更新するか。
    const ids = [];
    if (activeItem.type === 'paper') {
      ids.push(activeItem?.parentId);
    }
    if (overItem.type === 'paper') {
      ids.push(overItem?.parentId);
    }
    switch (area) {
      case 'page-list':
        updatePageList(project);
        break;
      case 'board-list':
        updateBoardList(project);
        break;
      case 'paper':
        window.electron.ipcRenderer.sendMessage('updateBoardPapers', ids);
        break;
      default:
    }
  }

  // ドロップ後の処理分け
  function caseUpdate() {
    updateList(activeItem.area);
    if (activeItem.area !== overItem.area) {
      updateList(overItem.area);
    }
  }

  // 新規に登録する場合
  function createNewArg() {
    // ボードリストにフォルダを移動した場合
    if (overItem.id === 'board-list') {
      const arg = {
        table: 'folder',
        id: activeItem?.itemId,
        position: -1,
        type: 'board',
      };
      return arg;
    }
    if (overItem.id === 'page-list') {
      const arg = {
        table: adjustTableName(activeItem.type),
        id: activeItem?.itemId,
        position: -1,
      };
      if (activeItem.type === 'board') {
        arg.type = 'folder';
      }
      return arg;
    }
    if (overItem.id === 'paper-list') {
      const arg = {
        position: -1,
        page_id: activeItem?.itemId,
        folder_id: overItem?.parentId,
      };
      return arg;
    }
  }

  function updatePaperIndex(index) {
    const ary = [];
    index.forEach((item, index) => {
      const element = item.split('-');
      if (element[0] === 'page') {
        const arg = {
          folder_id: overItem?.parentId,
          page_id: parseInt(element[1]),
          position: index,
        };
        ary.push(arg);
      }
      if (element[0] === 'paper') {
        const arg = {
          folder_id: overItem?.parentId,
          page_id: parseInt(element[1]),
          position: index,
        };
        ary.push(arg);
      }
    });
    const values = [overItem?.parentId, ary];
    return values;
  }

  function adjustTableName(name: string) {
    switch (name) {
      case 'board':
        return 'folder';
      case 'paper':
        return 'page';
      default:
        return name;
    }
  }

  function translateItem(params: [string, string], index: number) {
    const table = adjustTableName(params[0]);
    const arg = {
      table,
      id: parseInt(params[1]),
      position: index,
    };
    // ページリスト→ボードリストの場合
    if (table === 'folder' && activeItem.area !== overItem.area) {
      arg.type = overItem.area === 'board-list' ? 'board' : 'folder';
    }
    return arg;
  }

  function translateForSidebar(pageIndex) {
    const ary = [];
    pageIndex.forEach((item, index) => {
      const element = item.split('-');
      if (element[0] === 'paper') {
        // 紐づけを取得して削除
        const value = {
          page_id: parseInt(element[1]),
          folder_id: activeItem?.parentId,
        };
        window.electron.ipcRenderer.sendMessage('destroyStore', value);
      }
      const arg = translateItem(element, index);
      ary.push(arg);
    });
    return ary;
  }
}

export default DragAndDrop;
