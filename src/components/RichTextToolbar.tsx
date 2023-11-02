import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';

import {
  EditorState,
  FormatType,
  ActionType,
  BridgeMessageType,
  RefRichTextToolbar,
  RichTextToolbarProps,
  FormatOptions,
} from '../types';

function RichTextToolbarImpl(
  { editorRef, children }: RichTextToolbarProps,
  ref: ForwardedRef<RefRichTextToolbar>
) {
  const [localState, setLocalState] = useState<EditorState>();

  const handleMessage = (event: WebViewMessageEvent) => {
    const { type, data } = JSON.parse(event.nativeEvent.data) || {};

    if (type === BridgeMessageType.MESSAGE) {
      const { state } = data || {};
      if (state) {
        setLocalState(state);
      }
    }
  };

  const sendBridgeMessage = useCallback(
    (data: object | string | number) => {
      const requestJson = JSON.stringify(data);
      if (editorRef?.current) {
        editorRef.current.postMessage?.(requestJson);
      }
    },
    [editorRef]
  );

  const getEditorState = () => {
    sendBridgeMessage({ actionType: ActionType.MESSAGE });
  };

  const format = useCallback(
    (formatType: FormatType, options?: FormatOptions) => {
      sendBridgeMessage({ actionType: ActionType.FORMAT, formatType, options });
    },
    [sendBridgeMessage]
  );

  const handleFormatPress = useCallback(
    (formatType: FormatType, options?: FormatOptions) => () =>
      format(formatType, options),
    [format]
  );

  useEffect(() => {
    getEditorState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useImperativeHandle(ref, () => ({ handleMessage, format }), []);

  return children({ state: localState, handleFormatPress });
}

export const RichTextToolbar = forwardRef(RichTextToolbarImpl);
