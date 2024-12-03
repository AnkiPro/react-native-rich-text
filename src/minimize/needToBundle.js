import {
  Editor,
  Mark,
  markPasteRule,
  markInputRule,
  mergeAttributes,
  InputRule,
} from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Document } from '@tiptap/extension-document';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Italic } from '@tiptap/extension-italic';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Strike } from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Text } from '@tiptap/extension-text';
import { Underline } from '@tiptap/extension-underline';
import { Heading } from '@tiptap/extension-heading';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Link } from '@tiptap/extension-link';
import { CodeBlock } from '@tiptap/extension-code-block';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import lowlight from 'lowlight';
import { hljs } from 'highlight.js/lib/index.js';
const highlight = hljs;

export {
  Bold,
  BulletList,
  Document,
  Dropcursor,
  Editor,
  Highlight,
  Heading,
  Image,
  Italic,
  Link,
  ListItem,
  Mark,
  OrderedList,
  Paragraph,
  Placeholder,
  Strike,
  Subscript,
  Superscript,
  Text,
  Underline,
  Color,
  TextStyle,
  InputRule,
  markPasteRule,
  markInputRule,
  mergeAttributes,
  HardBreak,
  CodeBlock,
  CodeBlockLowlight,
  highlight,
  lowlight,
};
