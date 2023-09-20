import { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField } from '@mui/material';
import { Resizable } from 're-resizable';
import { useDraggable } from '@dnd-kit/core';
import PlaneTextField from 'renderer/GlobalComponent/PlaneTextField';
import PaperBorder from './PaperBorder';
import EditorItem from '../Editor/EditorItem';
import { ReactComponent as HandleIcon } from '../../../../../assets/handle-dot.svg';

interface PaperSize {
  width: number;
  height: number;
}

function Boardpage({ pageData, orderArray, boardId, paperWidth, fullWidth }) {
  const [paperSize, setPaperSize] = useState<PaperSize | null>(null);
  const resizeRef = useRef();
  const dndId = `bp-${pageData.id}`;
  const isTop = orderArray[0] === dndId;
  const position = orderArray.findIndex((item) => item === dndId);

  useEffect(() => {
    if (pageData.setting) {
      const data = JSON.parse(pageData.setting);
      if (data.width) {
        const initialSize = {
          width: data.width,
          height: data.height,
        };
        setPaperSize(initialSize);
        return;
      }
    }

    const initialSize = {
      width: paperWidth,
      height: 400,
    };

    setPaperSize(initialSize);
  }, []);

  useEffect(() => {
    const size = {
      width: paperWidth,
      height: 300,
    };
    setPaperSize(size);
  }, [paperWidth]);

  const dndData = {
    area: 'boardBody',
    type: 'paper',
    content: pageData.title,
    id: pageData.id,
    parentId: boardId,
    orderArray,
    itemType: 'item',
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dndId,
    data: dndData,
  });

  useEffect(() => {}, []);

  function tellSize(size: PaperSize) {
    const currentsize = {
      width: resizeRef.current.offsetWidth,
      height: resizeRef.current.offsetHeight,
    };
    const newSize = {
      width: `${(currentsize.width / fullWidth) * 100}%`,
      height: currentsize.height,
    };
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
    window.electron.ipcRenderer.sendMessage('updateRecord', updateQuery);
  }

  return (
    <>
      {isTop && <PaperBorder dndData={dndData} index={0} />}
      {paperSize && (
        <Resizable
          enable={{ right: true, bottom: true, bottomRight: true }}
          size={paperSize}
          onResizeStop={(event, data, node, size) => tellSize(size)}
          bounds="window"
        >
          <Box ref={resizeRef} sx={{ height: '100%', width: '100%', p: 2 }}>
            <Paper
              className="boardPaper"
              elevation={1}
              ref={setNodeRef}
              sx={{
                height: '100%',
                width: '100%',
                position: 'relative',
                p: 4,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '2px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'transparent',
                },
                '&:hover::-webkit-scrollbar-thumb': {
                  backgroundColor: '#999',
                },
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
                sx={{ input: { px: 0 } }}
              />
              <EditorItem page={pageData} />
            </Paper>
          </Box>
        </Resizable>
      )}

      <PaperBorder dndData={dndData} index={position + 1} />
    </>
  );
}

export default Boardpage;
