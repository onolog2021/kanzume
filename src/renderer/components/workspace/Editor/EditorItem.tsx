import React, { useState, useRef, useEffect } from 'react';
import { Editor, markPasteRule } from '@tiptap/core';
import { EditorContent, BubbleMenu } from '@tiptap/react';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import CharacterCount from '@tiptap/extension-character-count';
import History from '@tiptap/extension-history';
import TextStyle from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import { Slice, Fragment, Node } from 'prosemirror-model';
import ContextMenu from 'renderer/components/ContextMenu';
import KanzumeBubbleMenu from './KanzumeBubbleMenu';

interface contextMenu {
  mouseX: number;
  mouseY: number;
}

function MyEditor({ page, isCount }) {
  const editor = useRef();
  const timeoutId = useRef(null);
  const [editorStatus, setEditorStatus] = useState(false);
  const [textCount, setTextCount] = useState(0);
  const [contextMenuStatus, setContextMenuStatus] =
    useState<contextMenu | null>(null);

  const Ruby = TextStyle.extend({
    parseHTML() {
      return [
        {
          tag: 'span.ruby',
        },
      ];
    },
    addAttributes() {
      return {
        class: {
          default: 'ruby',
        },
        ruby: {
          default: '',
        },
      };
    },
    addCommands() {
      return {
        setRubyReading:
          (rubyReading: string = 'test') =>
          ({ commands }) => {
            commands.updateAttributes('textStyle', { ruby: rubyReading });
          },
        toggleRuby:
          () =>
          ({ commands }) => {
            commands.toggleMark('textStyle');
          },
      };
    },
  });

  function clipboardTextParser(text, context, plain) {
    const blocks = text.replace().split(/(?:\r\n?|\n)/);
    const nodes = [];

    blocks.forEach((line) => {
      const nodeJson = { type: 'paragraph' };
      if (line.length > 0) {
        nodeJson.content = [{ type: 'text', text: line }];
      }
      const node = Node.fromJSON(context.doc.type.schema, nodeJson);
      nodes.push(node);
    });

    const fragment = Fragment.fromArray(nodes);
    return Slice.maxOpen(fragment);
  }

  function serializeNodeToText(node) {
    if (node.isText) {
      return node.text;
    }
    if (node.isBlock && node.childCount === 0) {
      return '\n'; // 空のブロックノードには改行を追加
    }
    let result = '';
    node.forEach((child) => {
      result += serializeNodeToText(child);
    });
    if (node.isBlock) {
      result += '\n'; // ブロックノードの終わりに改行を追加
    }
    return result;
  }

  // clipboardTextSerializerの定義
  function clipboardTextSerializer(slice) {
    return serializeNodeToText(slice.content);
  }

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
          Placeholder.configure({
            placeholder: 'No text ...',
          }),
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
          countText();
          saveContent();
        },
      };

      editor.current = new Editor({
        ...options,
        editorProps: {
          clipboardTextParser,
          clipboardTextSerializer,
        },
      });

      return Promise.resolve();
    }

    initialSetUp()
      .then(() => {
        setEditorStatus(true);
        editor.current.commands.focus();
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

  useEffect(() => {
    if (editor.current) {
      const jsonData = JSON.parse(page.content);
      editor.current.commands.setContent(jsonData);
    }
  }, [page]);

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
    window.electron.ipcRenderer.invoke('updateRecord', query);
  }

  function countText() {
    const count = editor.current.storage.characterCount.characters();
    setTextCount(count);
  }

  const contextMenuClose = () => {
    setContextMenuStatus(null);
  };

  const contextMenuOpen = (event) => {
    event.stopPropagation();
    setContextMenuStatus(
      contextMenuStatus === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };

  const copyText = () => {
    const { state } = editor.current;
    if (!state.selection.empty) {
      const selectedFragment = state.selection.content().content;
      const selectedText = serializeNodeToText(selectedFragment);
      window.navigator.clipboard.writeText(selectedText);
      contextMenuClose();
    }
  };

  const pasteText = async () => {
    const clipboardText = await window.navigator.clipboard.readText();

    const transaction = editor.current.state.tr.insertText(clipboardText);
    editor.current.view.dispatch(transaction);
    contextMenuClose();
  };

  const cutText = () => {
    copyText();
    const transaction = editor.current.state.tr.deleteSelection();
    editor.current.view.dispatch(transaction);
  };

  const menues = [
    {
      id: 'copy',
      menuName: 'コピー',
      method: copyText,
    },
    {
      id: 'paste',
      menuName: 'ペースト',
      method: pasteText,
    },
    {
      id: 'cut',
      menuName: '切り抜き',
      method: cutText,
    },
  ];

  return (
    <>
      {isCount && isCount ? (
        <p
          style={{
            fontSize: 16,
            fontFamily: 'Meiryo',
            textAlign: 'center',
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            fontWeight: 'bold',
            color: '#999',
          }}
        >
          文字数：{textCount}
        </p>
      ) : null}
      {editorStatus && (
        <>
          <EditorContent
            editor={editor.current}
            onContextMenu={(e) => {
              contextMenuOpen(e);
            }}
          />
          <BubbleMenu editor={editor.current}>
            <KanzumeBubbleMenu editor={editor.current} />
          </BubbleMenu>
          {contextMenuStatus && (
            <ContextMenu
              contextMenu={contextMenuStatus}
              onClose={contextMenuClose}
              menues={menues}
            />
          )}
        </>
      )}
    </>
  );
}

export default MyEditor;
