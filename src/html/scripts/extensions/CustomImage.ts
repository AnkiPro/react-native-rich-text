export const CustomImage = `
const CustomImage = Image.extend({
  addCommands() {
    return {
      setImage:
        options =>
        ({ chain, state }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: options,
            })
            .setTextSelection(state.selection.to)
            .run(),
    };
  },
});
`;
