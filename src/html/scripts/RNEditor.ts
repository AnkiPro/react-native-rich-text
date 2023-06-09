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

    this.instance = new Editor({
      element: editorContainerElement,
      editorProps: {
        handlePaste: this.handlePaste,
        attributes: {
          class: RNEditor.contentClass,
        },
        transformPastedHTML(html) {
          return html.replace(/<img.*?>|<a.*?<\\/a>/g, ''); // remove any images and links copied any pasted as HTML
        },
      },
      extensions: [
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
        Highlight.extend({ priority: 12 }),
      ],
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
    RNBridge.event("onChangeContent", {html: editor.getHTML(), json: editor.getJSON(), plainText: editor.getText()});
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

  static applyAction(action) {
    switch (action) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strike':
      case 'subscript':
      case 'superscript':
      case 'highlight':
        RNEditor.instance.chain().focus().toggleMark(action).run();
        break;
      case 'bulletList':
      case 'orderedList':
        if (RNEditor.instance.isActive(action)) {
          RNEditor.instance.chain().focus().setParagraph().run();
        } else {
          RNEditor.instance.chain().focus().toggleList(action).run();
        }
        break;
    }
  }

  static updateToolbar(instance) {
    const state = {};

    TOOLBAR_ACTIONS.forEach((action) => {
      if (action !== 'image') {
        state[action] = RNEditor.instance.isActive(action);
        if (document.getElementById(action)) {
          document.getElementById(action).style.background = RNEditor.instance.isActive(action) ? '#0f0' : '#fff'
        }
      }
    });

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
        RNBridge.console('update height');
        RNEditor.updateContentHeight();
      }, 50);

      RNEditor.changeScrollHeightTimer = setTimeout(() => {
        RNBridge.console('clear');
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
