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
import WorkSpace from './components/workspace/WorkSpace';
import SideBar from './components/sidebar/Sidebar';
import { ProjectContext, TabListContext } from './components/Context';
import Board from './components/sidebar/Board/Board';
import PageList from './components/sidebar/PageList/PageList';
import Project from './Classes/Project';
import { collectNames } from './components/GlobalMethods';
import TabList from './components/workspace/TabList';

interface itemData {
  id: string;
  itemId: number;
  type: string;
  area: string;
  index: any;
  parentId: number | null;
}

function Editor() {
  const projectId = useLocation().state?.project_id;
  const [project, setProject] = useContext<Project>(ProjectContext);
  const [tabList, setTabList] = useContext(TabListContext);
  const [activeItem, setActiveItem] = useState<itemData>();
  const [overItem, setOverItem] = useState<itemData>();
  const [boardIndex, setBoardIndex] = useState([]);
  const [pageIndex, setPageIndex] = useState();
  const [pageRoot, setPageRoot] = useState();
  const [boards, setBoards] = useState([]);
  const [tabIndex, setTabIndex] = useState([]);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 20,
    },
  });
  const sensors = useSensors(mouseSensor);
  const boardList = <Board boardIndex={boardIndex} boards={boards} />;
  const pageList = <PageList root={pageRoot} />;
  const tabs = <TabList tabIndex={tabIndex} />;
  const listArea = ['page-list', 'board-list', 'paper-list'];

  // プロジェクトの初期設定
  useEffect(() => {
    async function fetchData() {
      const thisProjectData = await fetchProjectData();
      await updatePageList(thisProjectData);
      await updateBoardList(thisProjectData);
    }
    fetchData();
  }, []);

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
      const projectData = await window.electron.ipcRenderer.invoke('findById', [
        'project',
        projectId,
      ]);
      const currentProject = new Project(projectData);
      setProject(currentProject);
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
      const newAry = result.map((element) => `board-${element.id}`);
      setBoardIndex(newAry);
    } catch (error) {
      console.log(error);
    }
  }

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
        <p>・・・</p>
      </DragOverlay>
    </DndContext>
  );

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

  function handleDragOver({ over }) {
    if (over && !listArea.includes(over.id)) {
      setOverItem({
        id: over.id,
        type: over.data.current.type,
        itemId: over.data.current.itemId,
        area: over.data.current.area,
        index: over.data.current.index,
        parentId: over.data.current.parentId,
      });
    }
    if (over && listArea.includes(over.id)) {
      setOverItem({
        id: over.id,
        type: 'new',
        parentId: over.data.current?.parentId,
      });
    }
  }

  // 要調査・先頭ドラッグの挙動がおかしいかも
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

  // ドロップ後にドラッグしたものとドロップした場所の更新
  async function handleDragEnd({ active, over }) {
    if (active && over && active.id !== over.id) {
      if (overItem.type === 'new') {
        // 落とした場所とアイテムに合わせて処理
        // フォルダ→ボード
        if (overItem.id === 'board-list' && activeItem.type === 'folder') {
          const arg = createNewArg();
          const query = { projectId: project.id, values: [arg] };
          await window.electron.ipcRenderer.sendMessage(
            'updatePosition',
            query
          );
          await updateBoardList(project);
        }
        // ボード→フォルダ
        if (
          overItem.id === 'page-list' &&
          (activeItem.type === 'paper' || activeItem.type === 'board')
        ) {
          const item = createNewArg();
          const args = { projectId: project.id, values: [item] };
          await window.electron.ipcRenderer.sendMessage('updatePosition', args);
          await updatePageList(project);
        }
        // ページ→ボード内
        if (overItem.id === 'paper-list' && activeItem.type === 'page') {
          const args = createNewArg();
          await window.electron.ipcRenderer.sendMessage('createNewStore', args);
          await updatePageList(project);
        }
        return;
      }
      // 新しいIndexを作成
      const newIndex = createNewIndex();
      // newindex.length>0のときに実施するコード

      if (overItem.area === 'page-list') {
        const valuesArray = translateForSidebar(newIndex);
        const args = { projectId: project.id, values: valuesArray };
        window.electron.ipcRenderer.sendMessage('updatePosition', args);
      }

      // 発火の条件分けでfolderとboardのときのみにするのを忘れずにね。
      if (overItem.area === 'board-list' && activeItem.type !== 'page') {
        const valuesArray = translateForSidebar(newIndex);
        const args = { projectId: project.id, values: valuesArray };
        window.electron.ipcRenderer.sendMessage('updatePosition', args);
      }

      if (overItem.area === 'board-body') {
        const valuesArray = updatePaperIndex(newIndex);
        window.electron.ipcRenderer.sendMessage(
          'droppedBoardBody',
          valuesArray
        );
      }

      caseUpdate();
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

export default Editor;
