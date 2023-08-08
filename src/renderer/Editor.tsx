import { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { loadavg } from 'os';
import { act } from 'react-test-renderer';
import WorkSpace from './components/workspace/WorkSpace';
import SideBar from './components/sidebar/Sidebar';
import { ProjectContext, TabListContext } from './components/Context';
import Board from './components/sidebar/Board/Board';
import PageList from './components/sidebar/PageList/PageList';
import Project from './Classes/Project';
import { collectNames, updatePosition } from './components/GlobalMethods';
import TabList from './components/workspace/TabList';
import Folder from './Classes/Folder';

interface itemData {
  id: string;
  itemId: number;
  type: string;
  area: string;
  index: any;
  parentId: number | null;
}

function Editor() {
  const location = useLocation();
  const projectId = location.state?.project_id;
  const [project, setProject] = useContext(ProjectContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [activeItem, setActiveItem] = useState<itemData>();
  const [overItem, setOverItem] = useState<itemData>();
  const [boardIndex, setBoardIndex] = useState([]);
  const [pageIndex, setPageIndex] = useState();
  const [pageRoot, setPageRoot] = useState();
  const [boards, setBoards] = useState([]);
  const [tabIndex, setTabIndex] = useState([]);
  const folderType = ['folder', 'board'];
  const pageType = ['page', 'paper'];
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 20,
    },
  });
  const sensors = useSensors(mouseSensor);
  const boardList = <Board boardIndex={boardIndex} boards={boards} />;
  const pageList = <PageList root={pageRoot} />;
  const tabs = <TabList tabIndex={tabIndex} />;

  async function getProject() {
    try {
      const projectData = await window.electron.ipcRenderer.invoke('findById', [
        'project',
        projectId,
      ]);
      const currentProject = new Project({
        id: projectData.id,
        title: projectData.title,
      });
      setProject(currentProject);
      return currentProject;
    } catch (error) {
      console.error(error);
    }
  }

  async function getTree(thisProject: Project) {
    const tree: Node = await thisProject.createTree();
    setPageRoot(tree);
    const itemsData = collectNames(tree);
    const newary = itemsData.map(
      (nodeItem) => `${nodeItem.type}-${nodeItem.id}`
    );
    const newIndex = newary.filter((item) => !item.startsWith('project'));
    setPageIndex(newIndex);
  }

  async function getBoards(params: Project) {
    const result = await params.boards();
    setBoards(result);
    const newAry = result.map((element) => `board-${element.id}`);
    setBoardIndex(newAry);
  }

  async function createTabIndex() {
    if (tabList.length !== 0) {
      const newAry = tabList.map((tab) => tab.tabId);
      setTabIndex(newAry);
    }
  }

  useEffect(() => {
    async function fetchData() {
      const currentProject = await getProject();
      await getTree(currentProject);
      await getBoards(currentProject);
      await createTabIndex();
    }
    fetchData();
  }, []);

  useEffect(() => {
    createTabIndex();
  }, [tabList]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="editorPage">
        <SideBar
          project_id={projectId}
          boardList={boardList}
          pageList={pageList}
        />
        <WorkSpace tabs={tabs} />
      </div>
      <DragOverlay>
        <p>現在、越境中</p>
      </DragOverlay>
    </DndContext>
  );

  // 与えられた配列のなかの反対を返す
  function returnOpposite(keys: [string, string], paramWord: string) {
    const word = keys[0] === paramWord ? keys[1] : keys[0];
    return word;
  }

  function handleDragStart({ active }) {
    setActiveItem({
      id: active.id,
      type: active.data.current.type,
      itemId: active.data.current.itemId,
      area: active.data.current.area,
      index: active.data.current.index,
      parentId: active.data.current.parentId,
    });
  }

  function handleDragOver({ active, over }) {
    if (over) {
      setOverItem({
        id: over.id,
        type: over.data.current.type,
        itemId: over.data.current.itemId,
        area: over.data.current.area,
        index: over.data.current.index,
        parentId: over.data.current.parentId,
      });
    }
  }

  function createNewIndex() {
    let newIndex: string[];
    // areaが同じ場合
    if (activeItem.area === overItem.area) {
      if (activeItem && overItem && activeItem.id !== overItem.id) {
        const oldIndex = activeItem.index.findIndex(
          (page) => page === activeItem.id
        );
        const newPosition = overItem.index.findIndex(
          (page) => page === overItem.id
        );
        if (oldIndex !== -1 && newPosition !== -1) {
          newIndex = arrayMove(activeItem.index, oldIndex, newPosition);
        }
      }
    } else {
      // areaがちがう場合
      const oldIndex = overItem?.index;
      const newPosition = oldIndex.findIndex((item) => item === overItem.id);
      if (newPosition !== -1) {
        const newOverIndex = [...overItem.index];
        newOverIndex.splice(newPosition, 0, activeItem.id);
        newIndex = newOverIndex;
      }
    }
    return newIndex;
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
        getTree(project);
        break;
      case 'board-list':
        getBoards(project);
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

  // ドロップ後にドラッグしたものとドロップした場所の更新
  function handleDragEnd({ active, over }) {
    if (active && over) {
      // 新しいIndexを作成
      const newIndex = createNewIndex();

      // newindex.length>0のときに実施するコード

      if (overItem.area === 'page-list') {
        const valuesArray = translateForSidebar(newIndex);
        window.electron.ipcRenderer.sendMessage('updatePosition', valuesArray);
      }

      // 発火の条件分けでfolderとboardのときのみにするのを忘れずにね。
      if (overItem.area === 'board-list' && activeItem.type !== 'page') {
        const valuesArray = translateForSidebar(newIndex);
        window.electron.ipcRenderer.sendMessage('updatePosition', valuesArray);
      }

      if (overItem.area === 'board-body') {
        const valuesArray = updatePaperIndex(newIndex);
        window.electron.ipcRenderer.sendMessage('droppedBoardBody', valuesArray);
      }

      setTimeout(() => caseUpdate(), 300);
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
    const values = [overItem?.parentId, ary]
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

  function updateTabIndex(activeItem, overItem) {
    if (activeItem && overItem && activeItem.id !== overItem.id) {
      const oldIndex = tabIndex.findIndex((page) => page === activeItem.id);
      const newIndex = tabIndex.findIndex((page) => page === overItem.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTabIndex = arrayMove(tabIndex, oldIndex, newIndex);
        setTabIndex(newTabIndex);
        const ary = [];
        newTabIndex.forEach((tabId) => {
          const target = tabList.find((item) => item.tabId === tabId);
          ary.push(target);
        });
        setTabList(ary);
      }
    }
  }
}

export default Editor;
