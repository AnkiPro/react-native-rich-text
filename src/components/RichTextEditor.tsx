import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import type {
  WebViewErrorEvent,
  WebViewMessageEvent,
  WebViewNavigationEvent,
} from 'react-native-webview/src/WebViewTypes';

import { generateHTMLTemplate } from '../html';
import {
  FormatType,
  LayoutTargetedChangeEvent,
  ActionType,
  BridgeMessageType,
  RefRichTextEditor,
  RichTextEditorProps,
  FormatOptions,
} from '../types';
import { styles } from './RichTextEditor.styles';

function RichTextEditorImpl(
  {
    toolbarRef,
    scrollViewRef,
    htmlStyles,
    initialHTMLContent,
    style,
    placeholder,
    autoCapitalize,
    autoCorrect,
    autoFocus = false,
    focusOffsetY = 0,
    enterKeyHint,
    onLayoutContainer,
    onChangeHeight,
    onChangeContent,
    onChangeCursorPosition,
    onFocus,
    onPaste,
    onBlur,
    onReady,
    onLayout,
    removedActions,
    ...props
  }: RichTextEditorProps,
  ref: ForwardedRef<RefRichTextEditor>
) {
  const { placeholderColor, backgroundColor, caretColor, CSS } =
    htmlStyles || {};
  const {
    minHeight,
    maxHeight,
    height: styleHeight,
    ...flattenedStyle
  } = StyleSheet.flatten(style);
  const [inputHeight, setInputHeight] = useState(styleHeight || minHeight || 0);
  const webViewRef = useRef<WebView>(null);
  const hiddenInputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);
  const cursorYPosition = useRef<number>(0);
  const isFocused = useRef<boolean>(false);
  const isKeyboardOpen = useRef<boolean>(false);

  const scrollToCursor = () => {
    if (scrollViewRef?.current) {
      containerRef.current?.measureLayout(
        scrollViewRef.current.getScrollableNode(),
        (...measureInput) => {
          const inputY = measureInput[1];
          const inputH = measureInput[3];
          if (isFocused.current) {
            let offsetY = cursorYPosition.current + inputY;
            if (cursorYPosition.current > inputH) {
              offsetY = cursorYPosition.current - inputH + inputY;
            }

            scrollViewRef.current?.scrollTo({
              y: offsetY - focusOffsetY,
              animated: true,
            });
          }
        },
        () => null
      );
    }
  };

  const showAndroidKeyboard = () => {
    if (
      Platform.OS === 'android' &&
      hiddenInputRef?.current &&
      !isFocused.current
    ) {
      hiddenInputRef.current.focus();
      webViewRef?.current?.requestFocus?.();
    }
  };

  const focusForAndroid = (delay = 100) => {
    setTimeout(() => {
      showAndroidKeyboard();

      sendBridgeMessage({ actionType: ActionType.EVENT, eventType: 'focus' });
    }, delay);
  };

  const handleChangeHeight = (height: number) => {
    if (!styleHeight) {
      setInputHeight(height);
    }
    onChangeHeight?.(height);
  };

  const handleLayout = (event: LayoutChangeEvent) =>
    onLayout?.(event as LayoutTargetedChangeEvent);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    onLayoutContainer?.(event);
    scrollToCursor();
  };

  const handleChangeCursorPosition = (y: number) => {
    cursorYPosition.current = y;
    onChangeCursorPosition?.(y);
  };

  const handleFocus = () => {
    isFocused.current = true;
    scrollToCursor();
    onFocus?.();
  };

  const handleBlur = () => {
    isFocused.current = false;
    onBlur?.();
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    if (toolbarRef?.current) {
      toolbarRef.current.handleMessage(event);
    }

    const { type, data, event: eventName } = JSON.parse(event.nativeEvent.data);
    if (type === BridgeMessageType.EVENT) {
      switch (eventName) {
        case 'onChangeHeight':
          handleChangeHeight?.(data?.height);
          break;
        case 'onPaste':
          onPaste?.();
          break;
        case 'onChangeContent':
          onChangeContent?.(data);
          break;
        case 'onChangeCursorPosition':
          handleChangeCursorPosition?.(data);
          break;
        case 'onFocus':
          handleFocus();
          break;
        case 'onBlur':
          handleBlur();
          break;
        default:
          break;
      }
    }

    if (type === BridgeMessageType.CONSOLE && __DEV__) {
      console.log('RTE Console: ', data);
    }
  };

  const sendBridgeMessage = (data: object | string | number) => {
    const requestJson = JSON.stringify(data);
    if (typeof ref !== 'function' && webViewRef?.current) {
      webViewRef.current.postMessage?.(requestJson);
    }
  };

  const focus = () => {
    if (!isFocused.current) {
      if (Platform.OS === 'android') {
        focusForAndroid();
      } else {
        sendBridgeMessage({ actionType: ActionType.EVENT, eventType: 'focus' });
      }
    }
  };

  const blur = () => {
    if (isFocused.current) {
      sendBridgeMessage({ actionType: ActionType.EVENT, eventType: 'blur' });
    }
  };

  const setContent = (data: string) => {
    sendBridgeMessage({
      actionType: ActionType.EVENT,
      eventType: 'setContent',
      data,
    });
  };

  const format = (formatType: FormatType, options?: FormatOptions) =>
    sendBridgeMessage({ actionType: ActionType.FORMAT, formatType, options });

  const unformat = (formatType: FormatType, options?: FormatOptions) =>
    sendBridgeMessage({ actionType: ActionType.UNFORMAT, formatType, options });

  const handleLoadEnd = (event: WebViewNavigationEvent | WebViewErrorEvent) => {
    if (autoFocus) {
      focus();
    }
    onReady?.(event);
  };

  useImperativeHandle(
    ref,
    () => ({
      postMessage: webViewRef?.current?.postMessage,
      focus,
      blur,
      format,
      unformat,
      setContent,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onKeyboardWillShow = () => {
    isKeyboardOpen.current = true;
  };
  const onKeyboardWillHide = () => {
    if (Platform.OS === 'android' && isKeyboardOpen.current) {
      blur();
    }
    isKeyboardOpen.current = false;
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      onKeyboardWillShow
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      onKeyboardWillHide
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const source = useMemo(
    () => ({
      html: generateHTMLTemplate({
        initialHTMLContent,
        backgroundColor,
        caretColor,
        placeholder,
        placeholderColor,
        autoCapitalize,
        autoCorrect,
        enterKeyHint,
        CSS,
        height: styleHeight,
        minHeight,
        maxHeight,
        removedActions,
      }),
    }),
    // need to avoid recreating RTE when `initialHTMLContent` update
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      backgroundColor,
      caretColor,
      placeholder,
      placeholderColor,
      autoCapitalize,
      autoCorrect,
      enterKeyHint,
      CSS,
      styleHeight,
      minHeight,
      maxHeight,
      removedActions,
    ]
  );

  return (
    <>
      <View
        ref={containerRef}
        style={[flattenedStyle, { height: inputHeight }]}
        onLayout={handleContainerLayout}
      >
        <WebView
          hideKeyboardAccessoryView
          incognito
          cacheEnabled={false}
          keyboardDisplayRequiresUserAction={false}
          overScrollMode="never"
          scalesPageToFit={false}
          scrollEnabled={!!styleHeight}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={!!styleHeight}
          {...props}
          ref={webViewRef}
          automaticallyAdjustContentInsets={false}
          originWhitelist={['*']}
          source={source}
          style={styles.webView}
          onLayout={handleLayout}
          onLoadEnd={handleLoadEnd}
          onMessage={handleMessage}
        />
      </View>

      {Platform.OS === 'android' && (
        <TextInput ref={hiddenInputRef} style={styles.hiddenInput} />
      )}
    </>
  );
}

export const RichTextEditor = forwardRef(RichTextEditorImpl);
