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
  const [paperIndex, setPaperIndex] = useState([]);
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
        <WorkSpace tabs={tabs} paperIndex={paperIndex} />
      </div>
      <DragOverlay>
        <p>現在、越境中</p>
      </DragOverlay>
    </DndContext>
  );

  function handleDragStart({ active }) {
    setActiveItem({
      id: active.id,
      itemId: active.data.current.itemId,
      type: active.data.current.type,
      index: active.data.current.index,
      parentId: active.data.current.parentId,
    });
  }

  function handleDragOver({ active, over }) {
    if (over) {
      setOverItem({
        id: over.id,
        itemId: over.data.current.itemId,
        type: over.data.current.type,
        index: over.data.current.index,
        parentId: over.data.current.parentId,
      });
    }
  }

  function handleDragEnd({ active, over }) {
    // 新しいIndexを作成
    let newIndex: string[];
    // typeが同じ場合
    if (activeItem.type === overItem.type) {
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
    }

    // typeが違う場合
    if (activeItem.type !== overItem.type) {
      const oldIndex = overItem?.index;
      const newPosition = overItem?.index.findIndex(
        (item) => item === overItem.id
      );
      if (newPosition !== -1) {
        const newOverIndex = [...overItem.index];
        newOverIndex.splice(newPosition, 0, activeItem.id);
        newIndex = newOverIndex;
      }
    }

    if (overItem.type === 'page-list') {
      const valuesArray = updatePageIndex(newIndex);
      console.log(valuesArray);
      window.electron.ipcRenderer.sendMessage('updatePosition', valuesArray);
    }

    // 送信用オブジェクトの作成

    // if (newIndex) {
    //   switch (overItem.type) {
    //     case 'page-list':
    //       updatePageIndex(newIndex);
    //       break;
    //     default:
    //   }
    // }
    // if (activeItem.type !== overItem?.type) {
    //   convertItem(activeItem, overItem);
    // }
    // switch (overItem?.type) {
    //   case 'page':
    //   case 'folder':
    //     updatePageIndex(active, over);
    //     break;
    //   case 'board':
    //     updateBoardIndex(active, over);
    //     break;
    //   case 'tab':
    //     updateTabIndex(active, over);
    //     break;
    //   case 'paper':
    //     updatePaperIndex(activeItem, overItem);
    //     break;
    //   default:
    //   // console.log('test');
    // }
  }

  function convertItem(active: itemData, over: itemData) {
    if (active.type === 'folder') {
      if (over.type === 'board') {
        // const values = {id: active.itemId, type: 'board', position: -1}
        // window.electron.ipcRenderer.sendMessage('updateFolder', values);
        const newActiveIndex = active.index.filter(
          (item) => item === active.id
        );
        const newPosition = over.index.findIndex((item) => item === over.id);
      }
    }
  }

  function updatePaperIndex(activeItem, overItem) {
    const originalindex = activeItem.index;
    const oldIndex = originalindex.findIndex((item) => item === activeItem.id);
    const newIndex = originalindex.findIndex((item) => item === overItem.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newPaperIndex = arrayMove(originalindex, oldIndex, newIndex);
      const ary = [];
      // storeIdだから注意
      newPaperIndex.forEach((item, position) =>
        ary.push({
          table: 'store',
          id: parseInt(item.replace('paper-', '')),
          position,
        })
      );
      const submitIndex = async () =>
        await window.electron.ipcRenderer.sendMessage('updatePosition', ary);
      submitIndex();
      setPaperIndex(newPaperIndex);
    }
  }

  function updatePageIndex(pageIndex) {
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
      switch (element[0]) {
        case 'page':
        case 'paper':
          {
            const arg = {
              table: 'page',
              id: parseInt(element[1]),
              position: index,
            };
            ary.push(arg);
          }
          break;
        case 'folder':
          {
            const arg = {
              table: 'folder',
              id: parseInt(element[1]),
              position: index,
            };
            ary.push(arg);
          }
          break;
        case 'board':
          {
            const arg = {
              table: 'folder',
              id: parseInt(element[1]),
              position: index,
              type: 'folder',
            };
            ary.push(arg);
          }
          break;
        default:
      }
    });
    return ary;

    // if (activeItem && overItem && activeItem.id !== overItem.id) {
    //   const oldIndex = ary.findIndex((page) => page === activeItem.id);
    //   const newIndex = ary.findIndex((page) => page === overItem.id);
    //   const newAry: string[] = [];
    //   if (oldIndex !== -1 && newIndex !== -1) {
    //     const newPageList = arrayMove(newAry, oldIndex, newIndex);
    //     newPageList.forEach((item, index) => {
    //       if (!item.startsWith('project')) {
    //         const paramId = item.startsWith('folder')
    //           ? item.replace('folder-', '')
    //           : item.replace('page-', '');
    //         const paramType = item.startsWith('folder') ? 'folder' : 'page';
    //         const type = item.startsWith('folder') ? 'folder' : null;
    //         newAry.push({
    //           table: paramType,
    //           id: paramId,
    //           position: index,
    //           type,
    //         });
    //       }
    //     });
    //     const submitIndex = async () => {
    //       const arg = [newAry, 'pageList'];
    //       await window.electron.ipcRenderer.sendMessage('updatePosition', arg);
    //       await getTree(project);
    //     };
    //   console.log(newAry)
    //   submitIndex();
    //   }
    // }
  }

  function updateBoardIndex(activeItem, overItem) {
    if (activeItem && overItem && activeItem.id !== overItem.id) {
      const oldIndex = boardIndex.findIndex((page) => page === activeItem.id);
      const newIndex = boardIndex.findIndex((page) => page === overItem.id);
      const ary = [];
      if (oldIndex !== -1 && newIndex !== -1) {
        const newBoardIndex = arrayMove(boardIndex, oldIndex, newIndex);
        newBoardIndex.forEach((item, index) => {
          if (!item.startsWith('project')) {
            const paramId = item.replace('board-', '');
            ary.push({
              table: 'folder',
              id: paramId,
              position: index,
              type: 'board',
            });
          }
        });
        const submitIndex = async () => {
          await window.electron.ipcRenderer.sendMessage('updatePosition', ary);
          await getBoards(project);
        };
        submitIndex();
        setBoardIndex(newBoardIndex);
      }
    }
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
