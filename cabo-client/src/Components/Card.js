import React, { useEffect } from 'react';
import { useState } from 'react';
import back from '../cards/back.svg';
import { socket } from '../App.js';
import styled from 'styled-components';

const transformCard = (props) => {
  let transform = "";
  transform += props.$rotate ? "rotateY(180deg)" : "rotateY(0deg)";
  if (props.highlight) {
    transform += "translate(0, -10px)";
  }
  return transform;
}

const CardContainer = styled.div`
    transition: ${props => props.transition ? `${props.transitionTime / 1000}s` : "0.3s"};
    transform: ${transformCard};
    width: 103px;
    height: 150px;
    border-radius: 5px;
    box-shadow: 0px 0px 5px 1px #DEDEDE;
    transform-style: preserve-3d;
    position: relative;
    cursor: pointer;

    grid-area: ${({gridArea}) => gridArea};
    
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

const Card = ({ cardImage, gridArea, onClick, saveRef, transition, transitionTime, flipped}) => {
  const [isSelected, setSelected] = useState(false)

  const handleClick = () => {
    onClick();
    // socket.emit("FlipCard", index, socket.id);
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
    });
  }, []);

  return (
    <CardContainer
      ref={ref => saveRef(ref)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      $rotate={flipped}
      highlight={isSelected}
      gridArea={gridArea}
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