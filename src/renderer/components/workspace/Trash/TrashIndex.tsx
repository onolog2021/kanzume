import StyledScrollbarBox from 'renderer/GlobalComponent/StyledScrollbarBox';
import TrashedItem from './TrashedItem';

export default function TrashIndex({ items, click }) {
  return (
    <StyledScrollbarBox sx={{}}>
      {items &&
        items.map((item, index) => (
          <TrashedItem key={index} item={item} setSelectedItem={click} />
        ))}
    </StyledScrollbarBox>
  );
}
