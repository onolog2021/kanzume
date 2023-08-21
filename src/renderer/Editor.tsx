import DragAndDrop from './DragAndDrop';
import {
  ProjectProvider,
  CurrentPageProvider,
  PageListProvider,
  TabListProvider,
} from './components/Context';

function Editor() {
  return (
    <ProjectProvider>
      <TabListProvider>
        <CurrentPageProvider>
          <DragAndDrop />
        </CurrentPageProvider>
      </TabListProvider>
    </ProjectProvider>
  );
}

export default Editor;
