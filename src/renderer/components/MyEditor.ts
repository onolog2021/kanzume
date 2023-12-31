import EditorJS from '@editorjs/editorjs';
import Undo from 'editorjs-undo';

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

  constructor(targetId: string, pageId: number, minHeight = 0) {
    if (pageId) {
      const getPageData = async () => {
        const query = {
          table: 'page',
          conditions: { id: pageId },
        };
        const pageData = await window.electron.ipcRenderer.invoke(
          'fetchRecord',
          query
        );

        const textData = !pageData ? {} : JSON.parse(pageData.content);

        this.initializeEditor(textData, targetId, pageId, minHeight); // getPageData 完了後にエディタを初期化
      };
      getPageData();
    } else {
      this.initializeEditor({}, targetId, null, minHeight); // pageId がない場合もエディタを初期化
    }
  }

  private initializeEditor(
    textData: any,
    targetId: string,
    pageId: number | null,
    minHeight: number | null
  ) {
    this.editor = new EditorJS({
      holder: targetId,
      minHeight,
      tools: {
        // header: {
        //   class: Header,
        //   config: {
        //     placeholder: 'Header',
        //   },
        //   shortcut: 'CMD+SHIFT+H',
        //   inlineToolbar: true,
        // },
      },
      data: textData,
      inlineToolbar: true,
      onReady: () => {
        const { caret } = this.editor;
        caret.setToLastBlock('end', 0);

        // const undo = new Undo({ editor: this.editor });
      },
      onChange: debounce(async (api, event) => {
        const data = await api.saver.save();

        const formattedJson = JSON.stringify(data, null, 2);
        const paramData = formattedJson.replace(
          /({\s+"id":.*?}\s+)/gs,
          (match) => match.replace(/\s+/g, ' ').replace(/ : /g, ': ')
        );

        const query = {
          table: 'page',
          columns: {
            content: paramData,
          },
          conditions: {
            id: pageId,
          },
        };
        window.electron.ipcRenderer.invoke('updateRecord', query);

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

  destroy() {
    this.editor?.destroy();
  }

  // save()の処理を書いておく
  // それをcommitPageのときに実行できるようにする
  // 完成したらこのコメントは消すこと
}
