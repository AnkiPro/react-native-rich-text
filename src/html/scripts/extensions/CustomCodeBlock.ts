export const CustomCodeBlock = `
const COPY_SVG_HTML = \`
<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M10 2H14.7408C14.9992 2 15.2475 2.10001 15.4338 2.27906L19.693 6.37313C19.8891 6.56168 20 6.822 20 7.09407V16C20 17 19 18 18 18H10C9 18 8 17 8 16V4C8 3 9 2 10 2ZM9.99997 16H18V8H15C14.4477 8 14 7.55228 14 7V4H10L9.99997 16Z"/>
  <path d="M6 6C6 5.44772 5.55228 5 5 5C4.44772 5 4 5.44772 4 6V20C4 21 4.83997 22 5.83997 22H16C16.5523 22 17 21.5523 17 21C17 20.4477 16.5523 20 16 20H7C6.44772 20 6 19.5523 6 19V6Z"/>
</svg>\`;
const ARROW_DOWN_SVG_HTML = \`
<svg width="16" height="16" viewBox="0 0 24 24" style="transform: rotate(90deg);" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M7.293 3.293a1 1 0 0 1 1.414 0L16 10.586a2 2 0 0 1 0 2.828l-7.293 7.293a1 1 0 0 1-1.414-1.414L14.586 12 7.293 4.707a1 1 0 0 1 0-1.414" clip-rule="evenodd" />
</svg>\`;
const CODE_LOWLIGHT = lowlight.createLowlight(lowlight.all);

const getCodeHighlightedHTML = (editor) => {
  const html = editor.getHTML();
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, 'text/html');
  const highlightedDom = editor.view.dom;
  // Find all <pre><code> elements
  const codeBlocks = dom.querySelectorAll('pre code');
  const highlightedCodeBlocks = highlightedDom.querySelectorAll('pre code');
  // Replace their content
  codeBlocks.forEach((codeElement, i) => {
    const newContent = highlightedCodeBlocks[i]?.innerHTML || '';
    codeElement.innerHTML = newContent;
  });
  return dom.body.innerHTML;
};

const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ({ node, editor }) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('code-block');

      const header = document.createElement('div');
      header.classList.add('code-block-header');
      header.setAttribute('contenteditable', 'false');

      // Language Selector
      const languages = highlight.listLanguages();
      const customLanguageSelector = document.createElement('div');
      const customLanguageSelectorValue = document.createElement('span');
      const languageSelector = document.createElement('select');
      customLanguageSelector.classList.add('custom-code-language-selector');
      customLanguageSelectorValue.classList.add('custom-code-language-selector-value');
      languageSelector.classList.add('code-language-selector');
      languageSelector.setAttribute('contenteditable', 'false');
      languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        const { name = language } = highlight.getLanguage(language) || {};
        option.textContent = name;
        if (language === node.attrs.language) {
          option.selected = true;
          customLanguageSelectorValue.textContent = name;
        }
        languageSelector.appendChild(option);
      });
      languageSelector.addEventListener('change', () => {
        editor.commands.updateAttributes('codeBlock', { language: languageSelector.value });
        setTimeout(() => editor.commands.focus(), 600);
      });

      // Copy Button
      const copyButton = document.createElement('button');
      copyButton.classList.add('code-copy-button');
      copyButton.setAttribute('contenteditable', 'false');
      copyButton.innerHTML = COPY_SVG_HTML;
      copyButton.addEventListener('click', () => {
        const codeContent = wrapper.querySelector('code')?.textContent || '';
        RNBridge.event('onRequestCopyToClipboard', codeContent);
      });

      customLanguageSelector.appendChild(customLanguageSelectorValue);
      customLanguageSelector.innerHTML += ARROW_DOWN_SVG_HTML;
      header.appendChild(customLanguageSelector);
      header.appendChild(languageSelector);
      header.appendChild(copyButton);

      // Code Block
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = node.textContent;
      pre.appendChild(code);

      wrapper.appendChild(header);
      wrapper.appendChild(pre);

      return {
        dom: wrapper,
        contentDOM: code,
      };
    };
  },

  renderHTML: undefined,
});
`;
