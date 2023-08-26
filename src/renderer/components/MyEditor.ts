import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Undo from 'editorjs-undo';
import Page from 'renderer/Classes/Page';

function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default class MyEditor {
  private editor: EditorJS;

  constructor(targetId: string, pageId: number) {
    if (pageId) {
      const getPageData = async () => {
        const query = {
          table: 'page',
          conditions: {id: pageId}
        }
        const pageData = await window.electron.ipcRenderer.invoke('fetchRecord', query);
        const textData = !pageData ? {} : JSON.parse(pageData.content);

        this.initializeEditor(textData, targetId, pageId); // getPageData 完了後にエディタを初期化
      };
      getPageData();
    } else {
      this.initializeEditor({}, targetId); // pageId がない場合もエディタを初期化
    }
  }

  private initializeEditor(
    textData: any,
    targetId: string,
    pageId: number | null
  ) {
    this.editor = new EditorJS({
      holder: targetId,
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Header',
          },
          shortcut: 'CMD+SHIFT+H',
          inlineToolbar: true,
        },
      },
      data: textData,
      inlineToolbar: true,
      onReady: () => {
        new Undo({ editor: this.editor });
      },
      onChange: debounce(async (api, event) => {
        const data = await api.saver.save();
        window.electron.ipcRenderer.sendMessage('saveTextData', [
          JSON.stringify(data),
          pageId,
        ]);
        const contentLen = this.getBlocksTextLen(data.blocks);
        const textCounter = document.getElementById('textCounter');
        if (textCounter) {
          textCounter.textContent = contentLen;
        }
      }, 2000),
    });
  }

  couldBeCounted(block) {
    return 'text' in block.data;
  }

  getBlocksTextLen(blocks) {
    return blocks.filter(this.couldBeCounted).reduce((sum, block) => {
      sum += block.data.text.length;
      return sum;
    }, 0);
  }

  saved(map: any) {
    this.editor
      .save()
      .then((outputData: JSON) => {
        map.set('content', JSON.stringify(outputData));
        console.log(map);
        window.electron.ipcRenderer.invoke('savePage', map).then((result) => {
          console.log('success');
        });
      })
      .catch((error) => {
        console.warn(error);
      });
  }

  destroy() {
    this.editor?.destroy();
  }
}
