import Editor from './Editor';
import {
  ProjectProvider,
  CurrentPageProvider,
  PageListProvider,
  TabListProvider,
} from './components/Context';

function EditorPage() {
  return (
    <ProjectProvider>
      <TabListProvider>
        <CurrentPageProvider>
          <Editor />
        </CurrentPageProvider>
      </TabListProvider>
    </ProjectProvider>
  );
}

export default EditorPage;
