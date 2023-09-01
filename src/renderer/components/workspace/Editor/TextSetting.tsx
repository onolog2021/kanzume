import { useEffect, useState } from 'react';
import { ReactComponent as TextSettingButton } from '../../../../../assets/text.svg';
import TextSettingWindow from './TextSettingWindow';

function TextSetting({ changeFontFunc }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = (boolean: Boolean) => {
    setIsOpen(boolean);
  };

  return (
    <>
      {isOpen ? (
        <TextSettingWindow
          closeWindow={toggleIsOpen}
          isOpen={isOpen}
          changeFontFunc={changeFontFunc}
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
