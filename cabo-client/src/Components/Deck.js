import styled from 'styled-components';
import back from '../cards/back.svg';
import Card from './Card';
import { cardImages } from '../cards';

const DeckContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(1, 1fr);
`;

function Deck({deck}) {
  return (
    <DeckContainer>
      <Card
        cardImage={cardImages[deck[0]]}
        index="00"
        saveRef={() => { }}
        onClick={() => {}}
        transition={false}
        transitionTime={500}
      />
      <Card
        cardImage={cardImages[deck[1]]}
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