export const Cloze = `
const CLOZE_DEFAULT_NUMBER = 1;
const CLOZE_INPUT_REGEX = /{{$/;
const CLOZE_PASTE_REGEX = /(?:^|\\s)((?:{{[Cc](\\d+)::)((?:[^*]+))(?:}}))/g;

const getAllClozeNumbers = (html) => {
  const matches = [...html.matchAll(/<cloze data-number=["|'](\\d+)["|']/g)];
  if (matches.length === 0) {
    return CLOZE_DEFAULT_NUMBER;
  }
  const clozeNumbers = matches.map(match => Number(match[1]));
  clozeNumbers.sort((a, b) => a - b);
  const sortedNumbers = [...new Set(clozeNumbers)];
  return sortedNumbers[sortedNumbers.length - 1] + 1;
};

const clozeInputRule = (find, { editor, name, type }) =>
  new InputRule({
    find,
    handler: ({ state, range }) => {
      if (editor.isActive(name)) return;

      const { tr } = state;
      const currentNumber = getAllClozeNumbers(editor.getHTML());
      tr.delete(range.from, range.to);

      const clozeMark = type.create({ number: currentNumber });
      tr.addMark(range.from, range.from + 1, clozeMark);
      tr.addStoredMark(clozeMark);
    },
  });

const Cloze = Mark.create({
  name: 'cloze',
  excludes: 'textStyle highlight cloze',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      number: {
        default: CLOZE_DEFAULT_NUMBER,
        parseHTML: element => element.getAttribute('data-number'),
        renderHTML: attributes => ({
          'data-number': attributes.number,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'cloze',
        getAttrs: element => {
          const hasNumber = element.hasAttribute('data-number');

          if (!hasNumber) {
            return false;
          }

          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['cloze', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setCloze:
        number =>
        ({ commands }) =>
          commands.setMark(this.name, { number: number || getAllClozeNumbers(this.editor.getHTML()) }),
      toggleCloze:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
      unsetCloze:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },

  addKeyboardShortcuts() {
    const action = () => {
      if (this.editor.view.state.selection.empty) {
        return false;
      }
      return this.editor.isActive(this.name) ? this.editor.commands.unsetCloze() : this.editor.commands.setCloze();
    }

    return {
      'Shift-[': action,
    };
  },

  addInputRules() {
    return [clozeInputRule(CLOZE_INPUT_REGEX, this), clozeInputRule(CLOZE_PASTE_REGEX, this)];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: CLOZE_PASTE_REGEX,
        type: this.type,
      }),
    ];
  },
});
`;
