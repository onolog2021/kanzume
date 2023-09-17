import { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField } from '@mui/material';
import MyEditor from 'renderer/components/MyEditor';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Resizable } from 're-resizable';
import { useDraggable } from '@dnd-kit/core';
import PaperBorder from './PaperBorder';
import EditorItem from '../Editor/EditorItem';
import { ReactComponent as HandleIcon } from '../../../../../assets/handle-dot.svg';

interface PaperSize {
  width: number;
  height: number;
}

function Boardpage({ pageData, orderArray, boardId, paperWidth }) {
  const titleRef = useRef();
  const [paperSize, setPaperSize] = useState<PaperSize | null>(null);

  const dndId = `bp-${pageData.id}`;
  const isTop = orderArray[0] === dndId;
  const position = orderArray.findIndex((item) => item === dndId);

  useEffect(() => {
    const initialSize = {
      width: paperWidth,
      height: 400,
    };

    setPaperSize(initialSize);
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

  const changeName = (title) => {
    const query = {
      table: 'page',
      columns: {
        title: titleRef.current.value,
      },
      conditions: {
        id: pageData.id,
      },
    };
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
  };

  function tellSize(size: PaperSize) {
    const widthDiff = size.width;
    const heightDiff = size.height;
    const oldsize = { ...paperSize };
    const newSize = {
      width: oldsize.width + widthDiff,
      height: oldsize.height + heightDiff,
    };
    setPaperSize(newSize);
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
          <Paper
            elevation={3}
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
            <TextField
              size="small"
              inputRef={titleRef}
              onBlur={changeName}
              defaultValue={pageData.title || null}
            />
            <EditorItem page={pageData} />
          </Paper>
        </Resizable>
      )}

      <PaperBorder dndData={dndData} index={position + 1} />
    </>
  );
}

export default Boardpage;
