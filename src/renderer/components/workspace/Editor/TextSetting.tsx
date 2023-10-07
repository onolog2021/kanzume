import { useState } from 'react';
import { Tooltip } from '@mui/material';
import PlaneIconButton from 'renderer/GlobalComponent/PlaneIconButton';
import { ReactComponent as TextSettingButton } from '../../../../../assets/text.svg';
import TextSettingWindow from './TextSettingWindow';

function TextSetting({
  page,
  changeFontSize,
  changeFontFamily,
  changeContentWidth,
  changeLineHeight,
  setting,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = (boolean: Boolean) => {
    const tmp = !isOpen;
    setIsOpen(tmp);
  };

  return (
    <>
      <Tooltip title="テキスト設定" placement="left">
        <PlaneIconButton
          onClick={(event) => {
            event.stopPropagation();
            toggleIsOpen(true);
          }}
        >
          <TextSettingButton />
        </PlaneIconButton>
      </Tooltip>

      {isOpen ? (
        <TextSettingWindow
          page={page}
          closeWindow={toggleIsOpen}
          setting={setting}
          changeFontSize={changeFontSize}
          changeFontFamily={changeFontFamily}
          changeContentWidth={changeContentWidth}
          changeLineHeight={changeLineHeight}
        />
      ) : null}
    </>
  );
}

export default TextSetting;
