export const RNEditor = `
class RNEditor {
  static instance;
  static isReady = false;
  static editorContainerElement;
  static contentClass = 'content';
  static contentHeight;
  static minContentHeight;
  static maxContentHeight;
  static prevContentHeight;
  static prevState;
  static debouncedUpdateState = debounce(RNEditor.updateToolbar, 100);
  static prevCursorYPosition = 0;
  static platform;
  static changeScrollHeightInterval;
  static changeScrollHeightTimer;

  static init({
    platform,
    content = '',
    autoFocus = false,
    cursorColor = '#000000',
    placeholder = 'Enter text here',
    enterKeyHint = '',
    autoCapitalize = 'off',
    autoCorrect = false,
    editorContainerElement,
    contentHeight,
    minContentHeight,
    maxContentHeight,
    removedExtensions = [],
  }) {
    this.platform = platform;
    this.editorContainerElement = editorContainerElement;
    this.contentHeight = contentHeight;
    this.minContentHeight = minContentHeight;
    this.maxContentHeight = maxContentHeight;
    this.isHandlingPaste = false;

    this.handlePaste = () => {
      // workaround for double triggering
      if (this.isHandlingPaste) {
        return;
      }

      this.isHandlingPaste = true;

      RNBridge.event("onPaste")

      setTimeout(() => {
        this.isHandlingPaste = false;
      }, 300);
    }

    const extensions = [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({ placeholder }),
      Image,
      Dropcursor.configure({ color: cursorColor }),
      Bold.extend({ priority: 10 }),
      Italic.extend({ priority: 10 }),
      Strike.extend({ priority: 10 }),
      Underline.extend({ priority: 10 }),
      Superscript.extend({ excludes: 'subscript', priority: 11 }),
      Subscript.extend({ excludes: 'superscript', priority: 11 }),
      ListItem,
      BulletList.extend({ keepMarks: true }),
      OrderedList.extend({ keepMarks: true }),
      TextStyle,
      HardBreak,
      CustomCodeBlock.configure({ lowlight: CODE_LOWLIGHT, defaultLanguage: 'javascript' }),
      Link.configure({ defaultProtocol: 'https', openOnClick: false, HTMLAttributes: { class: 'link' } }),
    ];

    if (!removedExtensions.includes('heading')) {
      extensions.push(Heading);
    }
    if (!removedExtensions.includes('highlight')) {
      extensions.push(Highlight.configure({ multicolor: true }));
    }
    if (!removedExtensions.includes('color')) {
      extensions.push(Color);
    }
    if (!removedExtensions.includes('cloze')) {
      extensions.push(Cloze);
    }
    if (!removedExtensions.includes('tts')) {
      extensions.push(TTS);
    }

    this.instance = new Editor({
      element: editorContainerElement,
      editorProps: {
        handlePaste: this.handlePaste,
        attributes: {
          class: RNEditor.contentClass,
        },
        transformPastedHTML(html) {
          return html
            .replace(/<style((.|\\n|\\r)*?)<\\/style>/gm, '') // remove all 'styles' tags with self content
            .replace(/<(?!\\/?(p|br)\\b)[^>]+>/g, '') // remove any html tag except <p> and <br>
        },
      },
      extensions,
      content,
      autofocus: autoFocus ? 'end' : false,
      onTransaction: RNEditor.handleTransaction,
      onSelectionUpdate: RNEditor.handleSelectionUpdate,
      onUpdate: RNEditor.handleUpdate,
      onFocus: RNEditor.handleFocus,
      onBlur: RNEditor.handleBlur,
      onCreate: RNEditor.handleCreate,
      onDestroy: RNEditor.handleDestroy,
    });

    this.contentElement = document.querySelector('.' + RNEditor.contentClass);
    this.contentElement.enterKeyHint = enterKeyHint;
    this.contentElement.autocapitalize = autoCapitalize;
    this.contentElement.autocorrect = autoCorrect;
    this.contentElement.autocomplete = 'off';

    RNBridge.initListener();
    RNEditor.subscribeOnChangeScrollHeight();
  }

  static handleDestroy() {
    if (RNEditor.changeScrollHeightInterval) {
      clearInterval(RNEditor.changeScrollHeightInterval);
    }
    if (RNEditor.changeScrollHeightTimer) {
      clearTimeout(RNEditor.changeScrollHeightTimer);
    }
  }

  static handleCreate({ editor }) {
    RNEditor.isReady = true;
    RNBridge.event("onEditorReady");
    RNEditor.updateContentHeight();
  }

  static handleUpdate({ editor }) {
    RNEditor.updateContentHeight();
    RNBridge.event("onChangeContent", {html: getCodeHighlightedHTML(editor), json: editor.getJSON(), plainText: editor.getText()});
  }

  static handleTransaction({ editor }) {
    RNEditor.updateContentHeight();
    RNEditor.debouncedUpdateState(editor);
  }

  static handleSelectionUpdate({ editor }) {
    RNEditor.updateCursorPosition();
    RNEditor.debouncedUpdateState(editor);
  }

  static handleFocus() {
    RNBridge.event("onFocus");
  }

  static handleBlur() {
    RNBridge.event("onBlur");
  }

  static applyAction(action, options) {
    let selection = RNEditor.instance.state.selection;
    if (options?.selection) {
      selection = options.selection;
    }
    switch (action) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strike':
      case 'subscript':
      case 'superscript':
      case 'tts':
        RNEditor.instance.chain().focus().toggleMark(action, options).run();
        break;
      case 'codeBlock':
        RNEditor.instance.chain().focus().setCodeBlock().run();
        break;
      case 'cloze':
        RNEditor.instance.chain().focus().setCloze(options?.number).run();
        break;
      case 'color':
        RNEditor.instance.chain().focus().setColor(options?.color).run();
        break;
      case 'highlight':
        RNEditor.instance.chain().focus().toggleHighlight({ color: options?.color }).run();
        break;
      case 'heading':
        RNEditor.instance.chain().focus().toggleHeading({ level: options?.level }).run();
        break;
      case 'bulletList':
      case 'orderedList':
        if (RNEditor.instance.isActive(action)) {
          RNEditor.instance.chain().focus().setParagraph().run();
        } else {
          RNEditor.instance.chain().focus().toggleList(action).run();
        }
        break;
      case 'link':
        const { url } = options || {};
        // cancelled
        if (url === null) {
          return;
        }
        if (url === '') {
          RNEditor.instance.chain().focus().setTextSelection(selection).extendMarkRange('link').unsetLink().run();
          return;
        }
        const parsedUrl = url.includes(':') ? url : 'https://' + url;
        RNEditor.instance.chain().focus().setTextSelection(selection).extendMarkRange('link').setLink({ href: parsedUrl, target: '_blank' }).run();
        break;
    }
  }

  static cancelAction(action, options) {
    let selection = RNEditor.instance.state.selection;
    if (options?.selection) {
      selection = options.selection;
    }
    switch (action) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strike':
      case 'subscript':
      case 'superscript':
      case 'cloze':
      case 'tts':
        RNEditor.instance.chain().focus().unsetMark(action).run();
        break;
      case 'codeBlock':
        RNEditor.instance.chain().focus().toggleCodeBlock().run();
        break;
      case 'highlight':
        RNEditor.instance.chain().focus().unsetHighlight().run();
        break;
      case 'color': {
        RNEditor.instance.chain().focus().unsetColor().run();
        // it is temporary solution to resolve this issue: https://github.com/ueberdosis/tiptap/issues/3702#issuecomment-1528689731
        RNEditor.instance.chain().focus().unsetMark('textStyle').run();
        break;
      }
      case 'heading':
        RNEditor.instance.chain().focus().toggleHeading({ level: options?.level }).run();
        break;
      case 'bulletList':
      case 'orderedList':
        RNEditor.instance.chain().focus().liftListItem(action).run();
        break;
      case 'link':
        RNEditor.instance.chain().focus().setTextSelection(selection).unsetLink().run();
        break;
      default:
        break;
    }
  }

  static updateToolbar(instance) {
    const state = {};

    const getAllClozeNumbers = (html) => {
      const matches = [...html.matchAll(/<cloze data-number=["|'](\\d+)["|']/g)];
      const clozeNumbers = matches.map(match => Number(match[1]));
      clozeNumbers.sort((a, b) => a - b);
      return [...new Set(clozeNumbers)];
    };

    TOOLBAR_ACTIONS.forEach((action) => {
      if (action !== 'image') {
        if (action.startsWith('heading')) {
          const level = RNEditor.instance.getAttributes(action).level;
          if (level && RNEditor.instance.isActive(action)) {
            state[action] = { level };
          } else {
            state[action] = false;
          }
        } else if (action === 'cloze') {
          const number = RNEditor.instance.getAttributes(action)?.number;
          const all = getAllClozeNumbers(RNEditor.instance.getHTML());
          state[action] = { isActive: RNEditor.instance.isActive(action), number, all };
        } else if (['textStyle', 'highlight'].includes(action)) {
          const color = RNEditor.instance.getAttributes(action)?.color;
          if (color && RNEditor.instance.isActive(action)) {
            state[action] = { color };
          } else {
            state[action] = false;
          }
        } else if (action === 'link') {
          const href = RNEditor.instance.getAttributes(action)?.href;
          if (href && RNEditor.instance.isActive(action)) {
            state[action] = { href };
          } else {
            state[action] = false;
          }
        } else {
          state[action] = RNEditor.instance.isActive(action);
        }
      }
    });

    const {from, to} = instance.state.selection;
    state.selection = {from, to};

    if (!shallowEqual(state, RNEditor.prevState)) {
      RNBridge.message({state});
      RNEditor.prevState = state;
    }
  }

  static updateCursorPosition() {
    const currentCursorYPosition = RNEditor.getCursorYPosition();
    if (currentCursorYPosition !== RNEditor.prevCursorYPosition) {
      RNBridge.event("onChangeCursorPosition", currentCursorYPosition);
      RNEditor.prevCursorYPosition = currentCursorYPosition;
    }
  }

  static getCursorYPosition() {
    const { anchorNode } = window.getSelection();
    const element = anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;
    const { y } = element.getBoundingClientRect();
    return y;
  }

  // needs only for Android
  static subscribeOnChangeScrollHeight() {
    if (RNEditor.platform === "android") {
      RNEditor.changeScrollHeightInterval = setInterval(() => {
        RNEditor.updateContentHeight();
      }, 50);

      RNEditor.changeScrollHeightTimer = setTimeout(() => {
        clearInterval(RNEditor.changeScrollHeightInterval);
      }, 3000)
    }
  }

  // for RN only
  static updateContentHeight() {
    if (!RNEditor.contentHeight && RNBridge.IS_RN && RNEditor.isReady) {
      const contentElement = document.querySelector('.' + RNEditor.contentClass);
      const height = document.body.offsetHeight === 0 ? 0 : contentElement.getBoundingClientRect().height;
      if (RNEditor.prevContentHeight !== height) {
        if (!RNEditor.minContentHeight && !RNEditor.maxContentHeight) {
          RNEditor.prevContentHeight = height;
          RNBridge.event("onChangeHeight", { height });
        } else {
          if (RNEditor.minContentHeight) {
            if (height > RNEditor.minContentHeight) {
              RNEditor.prevContentHeight = height;
            } else {
              RNEditor.prevContentHeight = RNEditor.minContentHeight;
            }
          }
          if (RNEditor.maxContentHeight) {
            if (height < RNEditor.maxContentHeight) {
              RNEditor.prevContentHeight = height;
            } else {
              RNEditor.prevContentHeight = RNEditor.maxContentHeight;
            }
          }
          RNBridge.event("onChangeHeight", { height: RNEditor.prevContentHeight });
        }
      }
    }
  }
}
`;
