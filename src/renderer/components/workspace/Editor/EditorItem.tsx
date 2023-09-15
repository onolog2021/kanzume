import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/core';
import { EditorContent, BubbleMenu } from '@tiptap/react';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import CharacterCount from '@tiptap/extension-character-count';
import History from '@tiptap/extension-history';
import KanzumeBubbleMenu from './KanzumeBubbleMenu';
import { Ruby, RubyReading } from './Ruby';

function MyEditor({ page }) {
  const editor = useRef();
  const timeoutId = useRef(null);
  const [editorStatus, setEditorStatus] = useState(false);
  const [textCount, setTextCount] = useState(0);

  useEffect(() => {
    async function initialSetUp() {
      const options = {
        extensions: [
          Document,
          Paragraph,
          Text,
          Bold,
          CharacterCount,
          History,
          Ruby,
          RubyReading
        ],
        content: page.content ? JSON.parse(page.content) : '',
        onUpdate: () => {
          countText();
          autoSave();
        },
        onCreate: () => {
          countText();
        },
        onBlur: () => {
          saveContent();
        },
      };

      editor.current = new Editor(options);
      return Promise.resolve();
    }

    initialSetUp()
      .then(() => {
        setEditorStatus(true);
      })
      .catch((error) => {
        console.log(error);
      });

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      editor.current?.destroy();
    };
  }, []);

  function autoSave() {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      saveContent();
    }, 2000);
  }

  function saveContent() {
    const currentValue = editor.current.getJSON();
    const jsonData = JSON.stringify(currentValue);
    const query = {
      table: 'page',
      columns: {
        content: jsonData,
      },
      conditions: {
        id: page.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  }

  function countText() {
    const count = editor.current.storage.characterCount.characters();
    setTextCount(count);
  }

  return (
    <>
      <p>文字数：{textCount}</p>
      {editorStatus && (
        <>
          <EditorContent editor={editor.current} />
          <BubbleMenu editor={editor.current}>
            <KanzumeBubbleMenu editor={editor.current} />
          </BubbleMenu>
        </>
      )}
    </>
  );
}

export default MyEditor;
