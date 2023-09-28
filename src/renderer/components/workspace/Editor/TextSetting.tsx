import { useState } from 'react';
import { ReactComponent as TextSettingButton } from '../../../../../assets/text.svg';
import TextSettingWindow from './TextSettingWindow';

function TextSetting({ page,changeFontSize, changeFontFamily,changeContentWidth,changeLineHeight,setting }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = (boolean: Boolean) => {
    const tmp = !isOpen;
    setIsOpen(tmp);
  };

  return (
    <>
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
      <TextSettingButton
        onClick={(event) => {
          event.stopPropagation();
          toggleIsOpen(true);
        }}
      />
    </>
  );
}

export default TextSetting;
