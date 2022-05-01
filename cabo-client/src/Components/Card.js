import React, { useEffect } from 'react';
import { useState } from 'react';
import back from '../cards/back.svg';
import { socket } from '../App.js';
import styled from 'styled-components';

const transformCard = (props) => {
  let transform = "";
  transform += props.rotate ? "rotateY(180deg)" : "rotateY(0deg)";
  if (props.highlight) {
    transform += "translate(0, -10px)";
  }
  return transform;
}

const CardContainer = styled.div`
    transition: ${props => props.transition ? `${props.transitionTime / 1000}s` : "0.3s"};
    transform: ${transformCard};
    width: 100%;
    height: 100%;
    border-radius: 2px;
    box-shadow: 2px 2px 4px 4px #DEDEDE;
    transform-style: preserve-3d;
    position: relative;
    cursor: pointer;

    grid-column-start: ${props => props.index % 2 + 1};
    grid-row-start: ${props => Math.floor(props.index / 2) + 1};
    
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

const CardBackFace = styled(CardFrontFace)`
    transform: rotateY(180deg);
`;

const Card = ({ cardImage, index, onClick, saveRef, transition, transitionTime, swap, flipped}) => {
  const [isSelected, setSelected] = useState(false)
  const [playerIdx, cardIdx] = index;

  const handleClick = () => {
    onClick();
    // socket.emit("FlipCard", index, socket.id);
    console.log(`emit card flip index: ${index}`);
  };

  const handleMouseEnter = event => {
    setSelected(true)
  };

  const handleMouseLeave = event => {
    setSelected(false)
  };

  useEffect(() => {
    socket.on("CardFlipped", rawData => {
      const data = JSON.parse(rawData);
      if (data.clientId === socket.id) {
        // this was the sender
        return;
      }
      if (index === data.cardId) {
        console.log(`card flipped! index: ${data.cardId}`);
      }
    });
  }, []);

  return (
    <CardContainer
      ref={ref => saveRef(index, ref)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      rotate={flipped}
      highlight={isSelected}
      index={cardIdx}
      transition={transition}
      transitionTime={transitionTime}
    >
      <CardFrontFace>
        <img src={cardImage} alt="card" />
      </CardFrontFace>
      <CardBackFace>
        <img src={back} alt="card" />
      </CardBackFace>
    </CardContainer>
  )
}

export default Card;