import React, { Box, Rating, Typography } from '@mui/material';
import { useContext } from 'react';
import { ReactComponent as Rectangle } from '../../../../../assets/rectangle.svg';
import { PageElement } from '../../../../types/sqlElement';
import { UpdateRecordQuery } from '../../../../types/renderElement';
import {
  ColumnsContext,
  ColumnsStateElement,
  calcItemWidth,
} from '../../Context';

function ColumnsCountSelector({ pages }: { pages: PageElement[] | undefined }) {
  const { columnsState, setColumnsState } = useContext(ColumnsContext);
  const runChangeColumnsCount = async (event, newValue) => {
    const newState: ColumnsStateElement = {
      ...columnsState,
      columns: newValue,
    };
    setColumnsState(newState);
    // ひとつあたりの大きさ
    const itemWidth = calcItemWidth(newState);
    const queryArray: UpdateRecordQuery<'page'>[] = [];
    if (pages) {
      pages.forEach((page) => {
        const oldSetting = JSON.parse(page.setting);
        const newSetting = {
          ...oldSetting,
          width: itemWidth,
        };
        if (!newSetting.height) {
          newSetting.height = 300;
        }
        const query: UpdateRecordQuery<'page'> = {
          table: 'page',
          columns: {
            setting: JSON.stringify(newSetting),
          },
          conditions: {
            id: page.id,
          },
        };
        queryArray.push(query);
      });
      await window.electron.ipcRenderer.invoke('updateRecords', queryArray);
    }
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
