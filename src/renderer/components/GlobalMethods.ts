import { DiffMatchPatch } from 'diff-match-patch-typescript';
import { text } from 'stream/consumers';

export function dateTranslateForYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
}

export function editorTextToPlaneText(json) {
  function extractText(node) {
    if (node.content) {
      return node.content.map(extractText).join('');
    }
    if (node.type === 'text') {
      return node.text;
    }
    return '';
  }

  function convertToPlainText(data) {
    return data.content.map(extractText).join('\n').trim();
  }

  const plainText = convertToPlainText(json);
  return plainText

  console.log(json);
  const textArray = [];
  json.content?.forEach((element) => {
    const textContent = element.content?.map((item) => item.text);
    if (textContent) {
      textArray.push(textContent[0]);
    } else {
      textArray.push('');
    }
  });

  return textArray.join('\n');
  // const textArray = json.blocks;
  // const planeText = textArray.map((block) => block.data.text);
  // return planeText;
}

export function gitDiffParse(diff: string) {
  const hunkPattern = /@@.*?@@[\s\S]*?(?=@@|$)/g;
  const hanks = diff.match(hunkPattern);
  if (hanks?.length > 1) {
    const objectPattern = /{[^}]+}/g;
    const textpart = hanks?.slice(1);
    return textpart;
  }
}

export function getCurrentTime() {
  const currentDate = new Date();
  const offset = currentDate.getTimezoneOffset() * 60000;
  const localISOTime = new Date(currentDate - offset)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  return localISOTime;
}

export function getDiff(textA: string, textB: string) {
  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(textA, textB);
  dmp.diff_cleanupSemantic(diff);
  return diff;
}
