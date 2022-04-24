import styled from 'styled-components';
import back from '../cards/back.svg';
import Card from './Card';

const DeckContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(1, 1fr);
`;

function Deck({topCard}) {
  return (
    <DeckContainer>
      <Card
        cardImage={topCard}
        index="00"
        saveRef={() => { }}
        onClick={() => {}}
        transition={false}
        transitionTime={500}
      />
      <Card
        cardImage={back}
        index="01"
        saveRef={() => { }}
        onClick={() => {}}
        transition={false}
        transitionTime={500}
      />
    </DeckContainer>
  )
}

export default Deck;