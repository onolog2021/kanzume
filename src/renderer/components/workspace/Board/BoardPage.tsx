import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField } from '@mui/material';
import { Resizable } from 're-resizable';
import PlaneTextField from 'renderer/GlobalComponent/PlaneTextField';
import { useSortable } from '@dnd-kit/sortable';
import { useTheme } from '@mui/material/styles';
import StyledScrollbarBox from 'renderer/GlobalComponent/StyledScrollbarBox';
import EditorItem from '../Editor/EditorItem';
import { ReactComponent as HandleIcon } from '../../../../../assets/handle-dot.svg';
import { PageElement } from '../../../../types/sqlElement';

interface PaperSize {
  width: number;
  height: number;
}

function Boardpage({
  pageData,
  orderArray,
  boardId,
  paperWidth,
  index,
}: {
  pageData: PageElement;
  orderArray: string[];
  boardId: number;
  paperWidth: string | undefined;
  index: number;
}) {
  const [paperSize, setPaperSize] = useState<PaperSize | undefined>();
  const titleRef = useRef();
  const resizeRef = useRef(null);
  const dndId = `bp-${pageData.id}`;
  const [isResizing, setIsResizing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    // セッティングにサイズデータはあるか？
    if (pageData.setting) {
      const data = JSON.parse(pageData.setting);
      if (data.width) {
        const initialSize = {
          width: data.width,
          height: data.height,
        };
        setPaperSize(initialSize);
      }
    } else {
      const initialSize = {
        width: paperWidth || 120,
        height: 300,
      };
      setPaperSize(initialSize);
    }
  }, []);

  // useEffect(() => {
  //   if (paperSize) {
  //     const newSize = { ...paperSize };
  //     newSize.width = paperWidth;
  //     setPaperSize(newSize);
  //   }
  // }, [paperWidth]);

  const dndData = {
    area: 'boardBody',
    type: 'paper',
    content: pageData.title,
    id: pageData.id,
    parentId: boardId,
    orderArray,
    itemType: 'border',
    position: index,
  };

  const { attributes, listeners, setNodeRef, isDragging, active, isOver } =
    useSortable({
      id: dndId,
      data: dndData,
    });

  function updateSize(size: PaperSize) {
    setIsResizing(false);
    const newSize = resizeRef?.current.size;
    setPaperSize(newSize);

    const oldSetting = pageData.setting ? JSON.parse(pageData.setting) : {};
    const newSetting = {
      ...oldSetting,
      ...newSize,
    };
    const updateQuery = {
      table: 'page',
      columns: { setting: JSON.stringify(newSetting) },
      conditions: {
        id: pageData.id,
      },
    };
    window.electron.ipcRenderer.invoke('updateRecord', updateQuery);
  }

  const changeName = () => {
    const title = titleRef.current.value;
    const query = {
      table: 'page',
      columns: {
        title,
      },
      conditions: {
        id: pageData.id,
      },
    };
    window.electron.ipcRenderer.invoke('updateRecord', query);
  };

  function fromWhich() {
    if (active) {
      if (active.data?.current.area !== 'boardBody') {
        return 'left';
      }
      if (active.data?.current.position === index) {
        return;
      }
      if (active.data?.current.position > index) {
        return 'left';
      }
      return 'right';
    }
  }

  const borderColer = theme.palette.primary.main;

  return (
    <Resizable
      enable={{ right: true, bottom: true, bottomRight: true }}
      onResizeStop={(event, data, node, size) => updateSize(size)}
      size={paperSize}
      ref={resizeRef}
      style={{
        margin: '16px 8px',
        opacity: isDragging ? 0.4 : 1,
        paddingRight: isOver && fromWhich() === 'right' ? '16px' : '0',
        paddingLeft: isOver && fromWhich() === 'left' ? '16px' : '0',
        borderLeft:
          isOver && fromWhich() === 'left'
            ? `2px solid ${borderColer}`
            : 'none',
        borderRight:
          isOver && fromWhich() === 'right'
            ? `2px solid ${borderColer}`
            : 'none',
      }}
    >
      <Paper
        className="boardPaper"
        elevation={1}
        ref={setNodeRef}
        sx={{
          position: 'relative',
          border: '0.5px solid #999',
          width: '100%',
          height: '100%',
        }}
      >
        <HandleIcon
          {...listeners}
          {...attributes}
          style={{
            width: 24,
            height: 24,
            cursor: isDragging ? 'grabbing' : 'grab',
            position: 'absolute',
            left: 4,
            top: 4,
          }}
        />
        <PlaneTextField
          defaultValue={pageData.title}
          inputRef={titleRef}
          onBlur={changeName}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translate(0, -100%)',
            overflow: 'visible',
            input: {
              opacity: 0.5,
              p: 0,
              fontSize: 11,
              fontWeight: 500,
            },
          }}
        />
        <StyledScrollbarBox sx={{ overflow: 'auto', height: '100%', p: 4 }}>
          <EditorItem page={pageData} isCount={false} />
        </StyledScrollbarBox>
      </Paper>
    </Resizable>
  );
}

export default Boardpage;
