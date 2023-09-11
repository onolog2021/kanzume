export function dateTranslateForYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
}

export function editorTextToPlaneText(json) {
  const textArray = json.blocks;
  const planeText = textArray.map((block) => block.data.text);
  return planeText;
}

export function gitDiffParse(diff: string) {
  // const lines = diff.split('\n');
  // const minus = lines.filter((item) => item.startsWith('-{'));
  // const plus = lines.filter((item) => item.startsWith('+{'));
  // console.log(minus,plus)
  return diff;
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
