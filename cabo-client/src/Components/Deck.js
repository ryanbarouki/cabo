import styled from 'styled-components';
import back from '../cards/back.svg';
import Card from './Card';
import { cardImages } from '../cards';
import { useState } from 'react';


const CardContainer = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 5px;
    box-shadow: 0px 0px 5px 1px #DEDEDE;
    transform-style: preserve-3d;
    position: relative;
    cursor: pointer;

    grid-column-start: 1;
    grid-row-start: 1;
    
    img {
        width: 100%;
        height: 100%;
    }
`;

const CardFrontFace = styled(CardContainer)`
    backface-visibility: hidden;
    position: absolute;
    width: 100%;
    height: 100%;
`;

function Deck() {
  return (
    <CardContainer>
      <CardFrontFace>
        <img src={back} alt="card" />
      </CardFrontFace>
    </CardContainer>
  )
}

export default Deck;