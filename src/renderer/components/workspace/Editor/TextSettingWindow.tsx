import { useEffect, useState, useRef } from 'react';
import {
  ClickAwayListener,
  Box,
  Typography,
  Slider,
  Select,
  MenuItem,
} from '@mui/material';

function TextSettingWindow({ closeWindow, changeFontFunc }) {
  const [fontList, setFontList] = useState({});
  const [fontStyle, setFontStyle] = useState('');
  const selectRef = useRef();

  function runCloseWindow(event) {
    closeWindow(false);
  }

  useEffect(() => {
    setFontStyle('Meiryo');
    const list = {
      游ゴシック: 'YuGothic',
      メイリオ: 'Meiryo',
      'ＭＳ ゴシック': 'MS Gothic',
      'ＭＳ 明朝': 'MS Mincho',
      ヒラギノ角ゴシック: 'Hiragino Kaku Gothic',
      ヒラギノ明朝: 'Hiragino Mincho',
      小塚ゴシック: 'Kozuka Gothic',
      小塚明朝: 'Kozuka Mincho',
      'Source Han Sans': 'Source Han Sans',
      'Source Han Serif': 'Source Han Serif',
      'Noto Sans CJK': 'Noto Sans CJK',
      'Noto Serif CJK': 'Noto Serif CJK',
    };
    setFontList(list);
  }, []);

  const changeFont = (event) => {
    const selectedFont = event.target.value;
    setFontStyle(selectedFont);
    changeFontFunc(selectedFont);
  };

  return (
    <ClickAwayListener onClickAway={() => runCloseWindow()}>
      <Box
        role="presentation"
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 520,
          p: 4,
          border: '1px solid rgba(0, 0, 0, 0.20)',
          backgroundColor: 'rgba(255, 255, 255, 0.95);',
          boxShadow: '0px 2px 2px 0px rgba(0, 0, 0, 0.2)',
          zIndex: 10,
        }}
      >
        <Typography variant="h6">テキスト設定</Typography>
        <Typography>フォントサイズ：</Typography>
        <Slider
          size="small"
          defaultValue={70}
          aria-label="Small"
          valueLabelDisplay="auto"
        />
        <Typography>フォントスタイル：</Typography>
        <select name="" id="" onChange={changeFont}>
          {fontList &&
            Object.entries(fontList).map(([key, value]) => (
              <option value={value as string} key={value as string}>
                {key}
              </option>
            ))}
        </select>
      </Box>
    </ClickAwayListener>
  );
}

export default TextSettingWindow;
