import { useEffect, useState, useRef, useContext } from 'react';
import { ClickAwayListener, Box, Typography, Slider } from '@mui/material';

function TextSettingWindow({
  page,
  setting,
  closeWindow,
  changeFontSize,
  changeFontFamily,
  changeLineHeight,
  changeContentWidth,
}) {
  const boxRef = useRef();
  const [fontList, setFontList] = useState({});
  const sizeRef = useRef<number | undefined>();
  const fontFamiryRef = useRef();
  const contentWidthRef = useRef<number | undefined>();
  const lineHeightRef = useRef<number | undefined>();

  function runCloseWindow() {
    closeWindow(false);
  }

  useEffect(() => {
    contentWidthRef.current = setting.contentWidth;
    sizeRef.current = setting.fontSize;
    lineHeightRef.current = setting.lineHeight;

    window.electron.ipcRenderer.invoke('getFonts').then((result) => {
      const list = new Object();
      result.map((font, index) => {
        list[font] = font;
      });
      setFontList(list);
    });
  }, [page]);

  function updateSizeRef(value) {
    changeFontSize(value);
    sizeRef.current = value;
  }

  function updateContentWidth(value) {
    changeContentWidth(value);
    contentWidthRef.current = value;
  }

  function updateLineMarginRef(value) {
    changeLineHeight(value);
    lineHeightRef.current = value;
  }

  function updateFontFamily(event) {
    const newFont = event.target.value;
    fontFamiryRef.current = newFont;
    changeFontFamily(newFont);
    updateSetting();
  }

  const updateSetting = () => {
    const currentSetting = {
      fontSize: sizeRef.current,
      fontFamily: fontFamiryRef.current,
      contentWidth: contentWidthRef.current,
      lineHeight: lineHeightRef.current,
    };

    const newSetting = {
      ...setting,
      ...currentSetting,
    };

    const query = {
      table: 'page',
      conditions: {
        id: page.id,
      },
      columns: {
        setting: JSON.stringify(newSetting),
      },
    };
    window.electron.ipcRenderer.invoke('updateRecord', query);
  };

  return (
    <ClickAwayListener onClickAway={() => runCloseWindow()}>
      {setting && (
        <Box
          role="presentation"
          ref={boxRef}
          sx={{
            color: '#333',
            textAlign: 'left',
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
            defaultValue={setting.fontSize}
            min={12}
            max={40}
            step={1}
            aria-label="Small"
            valueLabelDisplay="auto"
            onChange={(event, value) => {
              updateSizeRef(value);
            }}
            onChangeCommitted={updateSetting}
          />
          <Typography>ページ幅</Typography>
          <Slider
            size="small"
            defaultValue={setting.contentWidth}
            min={200}
            max={1200}
            step={10}
            aria-label="Small"
            valueLabelDisplay="auto"
            onChange={(event, value) => {
              updateContentWidth(value);
            }}
            onChangeCommitted={updateSetting}
          />
          <Typography>行幅</Typography>
          <Slider
            size="small"
            defaultValue={setting.lineHeight}
            min={0.5}
            max={3}
            step={0.1}
            aria-label="Small"
            valueLabelDisplay="auto"
            onChange={(event, value) => {
              updateLineMarginRef(value);
            }}
            onChangeCommitted={updateSetting}
          />
          {setting.fontFamily && (
            <select
              name="font-family"
              id="font-family-select"
              defaultValue={setting.fontFamily}
              onChange={(event) => updateFontFamily(event)}
            >
              {fontList &&
                Object.entries(fontList).map(([key, value]) => (
                  <option value={value as string} key={value as string}>
                    {key}
                  </option>
                ))}
            </select>
          )}
        </Box>
      )}
    </ClickAwayListener>
  );
}

export default TextSettingWindow;
