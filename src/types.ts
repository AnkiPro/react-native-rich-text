import { ReactElement, RefObject } from 'react';
import { ScrollView, ViewProps } from 'react-native';
import WebView, { WebViewMessageEvent, WebViewProps } from 'react-native-webview';

import {
  ChangeContentArgs,
  FormatType,
  LayoutTargetedChangeEvent,
  RefRichTextEditorBase,
  RefRichTextToolbarBase,
  RichTextToolbarChildrenArgs,
} from '../types';

export enum BridgeMessageType {
  CONSOLE = 'CONSOLE',
  MESSAGE = 'MESSAGE',
  EVENT = 'EVENT',
}

export enum ActionType {
  FORMAT = 'FORMAT',
  MESSAGE = 'MESSAGE',
  EVENT = 'EVENT',
}

export type RichTextEditorProps = Omit<WebViewProps, 'onLayout'> & {
  toolbarRef?: RefObject<RefRichTextToolbar>;
  scrollViewRef?: RefObject<ScrollView>;
  focusOffsetY?: number;
  actions?: generateHTMLTemplateArgs['actions'];
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
};

export type RefRichTextEditor = RefRichTextEditorBase & {
  postMessage?: WebView['postMessage'];
};

export type RefRichTextToolbar = RefRichTextToolbarBase & {
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
  actions?: FormatType[];
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
};
