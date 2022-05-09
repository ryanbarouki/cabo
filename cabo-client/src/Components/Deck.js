import styled from 'styled-components';
import back from '../cards/back.svg';
import Card from './Card';
import { cardImages } from '../cards';
import { useState } from 'react';



function Deck({deck, saveRef, handleCardSelect, transitionTime}) {
  const [flipped, setFlipped] = useState(true);
  const handleClick = () => {
    handleCardSelect("topDeck");
    setFlipped(true);
  }
  return (
      <Card
        cardImage={cardImages[deck[0]]}
        index="00"
        saveRef={ref => saveRef("topDeck", ref)}
        onClick={() => handleCardSelect("topDeck")}
        transition={false}
        transitionTime={transitionTime}
        flipped={flipped}
      />
  )
}

export default Deck;