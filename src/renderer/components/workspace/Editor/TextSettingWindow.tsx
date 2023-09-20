import { useEffect, useState, useRef, useContext } from 'react';
import {
  ClickAwayListener,
  Box,
  Typography,
  Slider,
  Select,
  MenuItem,
} from '@mui/material';
import { CurrentPageContext } from 'renderer/components/Context';

function TextSettingWindow({
  isOpen,
  closeWindow,
  changeFontSize,
  changeFontFamily,
}) {
  const [fontList, setFontList] = useState({});
  const [fontStyle, setFontStyle] = useState('');
  const sizeRef = useRef<number>(18);
  const [currentPage] = useContext(CurrentPageContext);

  function runCloseWindow(event) {
    closeWindow(false);
  }

  useEffect(() => {
    setFontStyle('Meiryo');
    window.electron.ipcRenderer.invoke('getFonts').then((result) => {
      const list = new Object();
      result.map((font, index) => {list[font] = font});
      setFontList(list)
    })
    // setFontList(list);
  }, []);

  const changeFont = async (event) => {
    const { value } = event.target;
    changeFontFamily(value);
    const fetchQuery = {
      table: 'page',
      conditions: {
        id: currentPage.id,
      },
    };
    const pageData = await window.electron.ipcRenderer.invoke(
      'fetchRecord',
      fetchQuery
    );
    const oldSetting = pageData.setting ? JSON.parse(pageData.setting) : {};
    const newFamily = {
      fontFamily: value,
    };
    const newSetting = {
      ...oldSetting,
      ...newFamily,
    };
    const updateQuery = {
      ...fetchQuery,
      columns: {
        setting: JSON.stringify(newSetting),
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', updateQuery);
  };

  const changeSize = (event, value) => {
    changeFontSize(value);
  };

  const changeSetting = async (event, value) => {
    const fetchQuery = {
      table: 'page',
      conditions: {
        id: currentPage.id,
      },
    };
    const pageData = await window.electron.ipcRenderer.invoke(
      'fetchRecord',
      fetchQuery
    );
    const oldSetting = pageData.setting ? JSON.parse(pageData.setting) : {};
    const newSize = {
      fontSize: value,
    };
    const newSetting = {
      ...oldSetting,
      ...newSize,
    };
    const updateQuery = {
      ...fetchQuery,
      columns: {
        setting: JSON.stringify(newSetting),
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', updateQuery);
  };

  return (
    <ClickAwayListener onClickAway={() => runCloseWindow()}>
      <Box
        role="presentation"
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
          defaultValue={18}
          min={12}
          max={40}
          step={1}
          aria-label="Small"
          valueLabelDisplay="auto"
          onChange={(event, value) => {
            changeSize(event, value);
          }}
          onChangeCommitted={changeSetting}
        />
        <Typography>フォントスタイル：</Typography>
        <select name="" id="" onChange={(event) => changeFont(event)}>
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
