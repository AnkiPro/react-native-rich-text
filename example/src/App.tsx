/* eslint-disable react/no-unstable-nested-components */
import React, { useRef } from 'react';

import { StyleSheet, View, Button } from 'react-native';
import {
  FormatType,
  RefRichTextEditor,
  RefRichTextToolbar,
  RichTextEditor,
  RichTextToolbar,
  RichTextToolbarChildrenArgs,
} from '@ankipro/react-native-rich-text';

const ACTIONS = [FormatType.bold, FormatType.italic, FormatType.underline];

export default function App() {
  const editorRef = useRef<RefRichTextEditor>(null);
  const toolbarRef = useRef<RefRichTextToolbar>(null);

  const renderAction =
    ({ state, handleFormatPress }: RichTextToolbarChildrenArgs) =>
    (action: FormatType) => {
      const isActive = !!state?.[action];
      const handlePress = handleFormatPress(action);
      return (
        <Button
          key={action}
          title={action}
          onPress={handlePress}
          color={isActive ? 'blue' : 'gray'}
        />
      );
    };

  return (
    <View style={styles.container}>
      <RichTextEditor
        ref={editorRef}
        autoCorrect
        startInLoadingState
        actions={ACTIONS}
        autoFocus
        initialHTMLContent={''}
        placeholder={'placeholder'}
        style={styles.editor}
        toolbarRef={toolbarRef}
      />
      <RichTextToolbar ref={toolbarRef} editorRef={editorRef}>
        {({ state, handleFormatPress }: RichTextToolbarChildrenArgs) => (
          <>{ACTIONS.map(renderAction({ state, handleFormatPress }))}</>
        )}
      </RichTextToolbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editor: {
    minHeight: 50,
    overflow: 'hidden',
  },
});
