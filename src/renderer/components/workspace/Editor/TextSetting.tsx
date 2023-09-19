import { useEffect, useState } from 'react';
import { ReactComponent as TextSettingButton } from '../../../../../assets/text.svg';
import TextSettingWindow from './TextSettingWindow';

function TextSetting({ changeFontSize, changeFontFamily }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = (boolean: Boolean) => {
    const tmp = !isOpen;
    setIsOpen(tmp);
  };

  return (
    <>
      {isOpen ? (
        <TextSettingWindow
          closeWindow={toggleIsOpen}
          isOpen={isOpen}
          changeFontSize={changeFontSize}
          changeFontFamily={changeFontFamily}
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
