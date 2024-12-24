import { Cloze } from './Cloze';
import { TTS } from './TTS';
import { CustomCodeBlock } from './CustomCodeBlock';

export const extensions = `
  ${CustomCodeBlock}
  ${Cloze}
  ${TTS}
`;
