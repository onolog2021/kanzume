import { mergeAttributes, Mark } from '@tiptap/core';

// Define the RubyReading mark
export const RubyReading = Mark.create({
  name: 'rt',
  // defaultOptions: {
  //   HTMLAttributes: {},
  // },
  parseHTML() {
    return [{ tag: 'rt' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'rt',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});

// Define the Ruby mark
export const Ruby = Mark.create({
  name: 'ruby',
  // defaultOptions: {
  //   HTMLAttributes: {},
  // },
  content: 'text*',
  parseHTML() {
    return [
      {
        tag: 'ruby',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['ruby', HTMLAttributes, 0];
  },
  // addKeyboardShortcuts() {
  //   return {
  //     'Mod-u': () => this.editor.commands.addRuby(),
  //   };
  // },
  addCommands() {
    return {
      addRuby:
        () =>
        ({ commands, editor }) => {
          const { from, to } = editor.state.selection;
          const text = editor.state.doc.textBetween(from, to, ' ');
          const placeholder = '???';
          const replacement = `<ruby>${text}<rt>${placeholder}</rt></ruby>`;
          commands.insertContent(replacement);

          // set selection on new furigana (which follows the text)
          return commands.setTextSelection({
            from: to,
            to: to + placeholder.length,
          });
        },
    };
  },
});

