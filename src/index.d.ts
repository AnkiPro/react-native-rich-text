import {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';

import {
  RefRichTextEditor,
  RefRichTextToolbar,
  RichTextEditorProps,
  RichTextToolbarProps,
} from './types';

declare const RichTextEditor: ForwardRefExoticComponent<
  PropsWithoutRef<RichTextEditorProps> & RefAttributes<RefRichTextEditor>
>;
declare const RichTextToolbar: ForwardRefExoticComponent<
  PropsWithoutRef<RichTextToolbarProps> & RefAttributes<RefRichTextToolbar>
>;

export { RichTextEditor, RichTextToolbar };
export * from './types';
