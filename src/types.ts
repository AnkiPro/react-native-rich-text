import { ReactElement, RefObject } from 'react';
import {
  ScrollView,
  ViewProps,
  LayoutRectangle,
  NativeSyntheticEvent,
  TargetedEvent,
} from 'react-native';
import WebView, {
  WebViewMessageEvent,
  WebViewProps,
} from 'react-native-webview';

export enum FormatType {
  image = 'image',
  bold = 'bold',
  italic = 'italic',
  underline = 'underline',
  strike = 'strike',
  subscript = 'subscript',
  superscript = 'superscript',
  orderedList = 'orderedList',
  bulletList = 'bulletList',
  highlight = 'highlight',
  color = 'color',
  textStyle = 'textStyle',
  heading = 'heading',
  cloze = 'cloze',
  tts = 'tts',
  link = 'link',
  codeBlock = 'codeBlock',
}

export type FormatOptions = Record<string, any>;

export type EditorState = { [key in FormatType]?: boolean | FormatOptions };

export type ChangeContentArgs = {
  html: string;
  json: JSON;
  plainText: string;
};

export type LayoutTargetedChangeEvent = NativeSyntheticEvent<
  { layout: LayoutRectangle } & TargetedEvent
>;

export type RichTextToolbarChildrenArgs = {
  state?: EditorState;
  handleFormatPress: (type: FormatType, options?: FormatOptions) => () => void;
};

export enum BridgeMessageType {
  CONSOLE = 'CONSOLE',
  MESSAGE = 'MESSAGE',
  EVENT = 'EVENT',
}

export enum ActionType {
  FORMAT = 'FORMAT',
  UNFORMAT = 'UNFORMAT',
  MESSAGE = 'MESSAGE',
  EVENT = 'EVENT',
}

export type RichTextEditorProps = Omit<WebViewProps, 'onLayout'> & {
  toolbarRef?: RefObject<RefRichTextToolbar>;
  scrollViewRef?: RefObject<ScrollView>;
  focusOffsetY?: number;
  actions?: generateHTMLTemplateArgs['actions'];
  removedActions?: generateHTMLTemplateArgs['removedActions'];
  placeholder?: generateHTMLTemplateArgs['placeholder'];
  autoCapitalize?: generateHTMLTemplateArgs['autoCapitalize'];
  autoCorrect?: generateHTMLTemplateArgs['autoCorrect'];
  enterKeyHint?: generateHTMLTemplateArgs['enterKeyHint'];
  initialHTMLContent?: generateHTMLTemplateArgs['initialHTMLContent'];
  htmlStyles?: {
    placeholderColor?: generateHTMLTemplateArgs['placeholderColor'];
    backgroundColor?: generateHTMLTemplateArgs['backgroundColor'];
    caretColor?: generateHTMLTemplateArgs['caretColor'];
    CSS?: generateHTMLTemplateArgs['CSS'];
  };
  autoFocus?: generateHTMLTemplateArgs['autoFocus'];
  onLayoutContainer?: ViewProps['onLayout'];
  onLayout?: (event: LayoutTargetedChangeEvent) => void;
  onChangeHeight?: (height: number) => void;
  onChangeContent?: ({ html, json, plainText }: ChangeContentArgs) => void;
  onChangeCursorPosition?: (y: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onReady?: WebViewProps['onLoadEnd'];
  onPaste?: () => void;
  onRequestCopyToClipboard?: (text: string) => void;
};

export type RefRichTextEditor = {
  focus: () => void;
  blur: () => void;
  format: (type: FormatType, options?: FormatOptions) => void;
  unformat: (type: FormatType, options?: FormatOptions) => void;
  setContent: (content: string) => void;
  postMessage?: WebView['postMessage'];
};

export type RefRichTextToolbar = {
  format: RefRichTextEditor['format'];
  handleMessage: (event: WebViewMessageEvent) => void;
};

export type RichTextToolbarProps = {
  editorRef?: RefObject<RefRichTextEditor>;
  children: (data: RichTextToolbarChildrenArgs) => ReactElement;
};

export type generateHTMLTemplateArgs = {
  containerCSSClass?: string;
  backgroundColor?: string;
  caretColor?: string;
  initialHTMLContent?: string;
  placeholder?: string;
  placeholderColor?: string;
  CSS?: string;
  autoFocus?: boolean;
  enterKeyHint?: string;
  autoCapitalize?: string;
  autoCorrect?: boolean;
  actions?: readonly FormatType[];
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  removedActions?: readonly FormatType[];
};
