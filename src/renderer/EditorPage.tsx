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
          <PageListProvider>
            <Editor />
          </PageListProvider>
        </CurrentPageProvider>
      </TabListProvider>
    </ProjectProvider>
  );
}

export default EditorPage;
