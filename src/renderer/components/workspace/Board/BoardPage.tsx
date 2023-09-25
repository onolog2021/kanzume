import { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField } from '@mui/material';
import { Resizable } from 're-resizable';
import PlaneTextField from 'renderer/GlobalComponent/PlaneTextField';
import { useSortable } from '@dnd-kit/sortable';
import { title } from 'process';
import PaperBorder from './PaperBorder';
import EditorItem from '../Editor/EditorItem';
import { ReactComponent as HandleIcon } from '../../../../../assets/handle-dot.svg';

interface PaperSize {
  width: number;
  height: number;
}

function Boardpage({
  pageData,
  orderArray,
  boardId,
  paperWidth,
  fullWidth,
  index,
}) {
  const [paperSize, setPaperSize] = useState<PaperSize | null>(null);
  const titleRef = useRef();
  const resizeRef = useRef();
  const dndId = `bp-${pageData.id}`;

  useEffect(() => {
    if(paperSize){
      const newSize = {...paperSize};
      newSize.width = paperWidth;
      setPaperSize(newSize);
    }
  },[paperWidth])

  useEffect(() => {
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
        width: paperWidth,
        height: 400,
      };
      setPaperSize(initialSize);
    }
  }, []);



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
    window.electron.ipcRenderer.sendMessage('updateRecord', query);
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

  return (
    <Resizable
      enable={{ right: true, bottom: true, bottomRight: true }}
      size={paperSize}
      onResizeStop={(event, data, node, size) => tellSize(size)}
      bounds="window"
    >
      <Box
        ref={resizeRef}
        sx={{
          height: '100%',
          width: '100%',
          borderLeft:
            isOver && fromWhich() === 'left' ? '2px solid tomato' : 'none',
          borderRight:
            isOver && fromWhich() === 'right' ? '2px solid tomato' : 'none',
        }}
      >
        <Paper
          className="boardPaper"
          elevation={2}
          ref={setNodeRef}
          sx={{
            height: '100%',
            width: '100%',
            position: 'relative',
            border: '0.5px solid #999',
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
            inputRef={titleRef}
            onBlur={changeName}
          />
          <EditorItem page={pageData} />
        </Paper>
      </Box>
    </Resizable>
  );
}

export default Boardpage;
