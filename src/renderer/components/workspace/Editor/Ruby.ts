import { mergeAttributes, Mark } from '@tiptap/core';

// Define the Ruby mark
const Ruby = Mark.create({
  name: 'ruby',

  content: 'text*',

  addAttributes() {
    return {
      class: {
        default: 'ruby',
      },
      ruby: {
        default: 'ruby',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.ruby',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },
  addCommands() {
    return {
      toggleRuby:
        (selection) =>
        ({ commands, editor }) => {},
      addRuby:
        (rubi = 'rubi', selection) =>
        ({ commands, editor }) => {
          if (!selection) return false;
          const text = editor.state.doc.textBetween(
            selection.from,
            selection.to,
            ' '
          );
          const replacement = `<span>${text}</span>`;
          commands.insertContent(replacement);

          return commands.setTextSelection({
            from: selection.from,
            to: selection.to,
          });
        },
    };
  },
});

export default Ruby;
