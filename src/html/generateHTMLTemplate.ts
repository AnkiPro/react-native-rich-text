import { Platform } from 'react-native';

import { generateHTMLTemplateArgs } from '../types';
import { RNBridge } from './scripts/RNBridge';
import { RNEditor } from './scripts/RNEditor';
import { utils } from './scripts/utils';

const { core } = require('../html/scripts/editorBundleString') || '';
if (!core) {
  console.log(
    '@ankipro/react-native-rich-text ERROR: the bundle was not generated.'
  );
}

export const generateHTMLTemplate = ({
  containerCSSClass = 'rn_editor',
  backgroundColor = 'rgba(0,0,0,0)',
  caretColor = '#000000',
  initialHTMLContent = '',
  placeholder = '',
  placeholderColor = '#a9a9a9',
  CSS = '',
  autoFocus = false,
  enterKeyHint = '',
  autoCapitalize = 'off',
  autoCorrect = false,
  actions,
  height,
  minHeight,
  maxHeight,
}: generateHTMLTemplateArgs) => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>RN Rich Text Editor</title>
    <meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
    <style>
      * {
        outline: 0px solid transparent;
        -webkit-tap-highlight-color: rgba(0,0,0,0);
        -webkit-touch-callout: none;
        box-sizing: border-box;
      }
      html, body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, Roboto, system-ui, "Segoe UI", sans-serif;
        font-size: 1em;
        height: 100%;
        width: 100%;
      }
      body {
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        background-color: ${backgroundColor};
        caret-color: ${caretColor};
      }
      p {
        line-height: 1.5em;
      }
      .${containerCSSClass} .content sup,
      .${containerCSSClass} .content sub {
        line-height: 0;
        font-size: small;
      }
      /* Placeholder */
      .${containerCSSClass} .content p.is-editor-empty:first-child::before {
        color: ${placeholderColor};
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }
      ${CSS}
    </style>
  </head>
  <body>
    <div class="${containerCSSClass}"></div>
    <script>
      ${core}
      (function() {
        ${utils}
        ${RNBridge}
        ${RNEditor}

        const TOOLBAR_ACTIONS = [${actions?.map((a) => `"${a}"`).toString()}];

        RNEditor.init({
          platform: "${Platform.OS}",
          editorContainerElement: document.querySelector('.${containerCSSClass}'),
          autoFocus: ${autoFocus},
          placeholder: "${placeholder}",
          cursorColor: "${caretColor}",
          content: \`${initialHTMLContent}\`,
          enterKeyHint: "${enterKeyHint}",
          autoCapitalize: "${autoCapitalize}",
          autoCorrect: ${autoCorrect},
          contentHeight: ${height},
          minContentHeight: ${minHeight},
          maxContentHeight: ${maxHeight},
        });
      })();
    </script>
  </body>
  </html>
`;
