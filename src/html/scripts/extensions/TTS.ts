export const TTS = `
const TTS = Mark.create({
  name: 'tts',
  excludes: '_',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'tts',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tts', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setTTS:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      toggleTTS:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
      unsetTTS:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
`;
