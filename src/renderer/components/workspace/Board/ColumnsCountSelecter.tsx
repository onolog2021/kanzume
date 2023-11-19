import React, { Box, Rating, Typography } from '@mui/material';
import { useContext } from 'react';
import { ReactComponent as Rectangle } from '../../../../../assets/rectangle.svg';
import { PageElement } from '../../../../types/sqlElement';
import { UpdateRecordQuery } from '../../../../types/renderElement';
import { ColumnsContext } from '../../Context';

function ColumnsCountSelector({
  changeColumnsCount,
  pages,
  fullwidth,
}: {
  changeColumnsCount: void | any;
  pages: PageElement[];
  fullwidth: number;
}) {
  const [columnsState, setColumnsState] = useContext(ColumnsContext);
  const runChangeColumnsCount = async (event, newValue) => {
    console.log(columnsState);
    // // ひとつあたりの大きさ
    // const marginWidth = 16;
    // const sumMarginWidth = marginWidth * newValue;
    // const itemWidth = (fullwidth - sumMarginWidth) / newValue - 16;
    // const queryArray: UpdateRecordQuery<'page'>[] = [];
    // pages.forEach((page) => {
    //   const oldSetting = JSON.parse(page.setting);
    //   const newSetting = {
    //     ...oldSetting,
    //     width: itemWidth,
    //   };
    //   if (!newSetting.height) {
    //     newSetting.height = 300;
    //   }
    //   const query: UpdateRecordQuery<'page'> = {
    //     table: 'page',
    //     columns: {
    //       setting: JSON.stringify(newSetting),
    //     },
    //     conditions: {
    //       id: page.id,
    //     },
    //   };
    //   queryArray.push(query);
    // });
    // await window.electron.ipcRenderer.invoke('updateRecords', queryArray);
  };

  return (
    <Box display="flex" gap={2}>
      <Rating
        name="columns-selecter"
        icon={
          <Rectangle
            style={{
              width: 30,
              margin: 3,
              fill: '#888',
            }}
          />
        }
        emptyIcon={
          <Rectangle style={{ width: 30, fill: '#D9D9D9', margin: 3 }} />
        }
        onChange={runChangeColumnsCount}
      />
    </Box>
  );
}

export default ColumnsCountSelector;
