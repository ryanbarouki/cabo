import React from 'react'
import { useState } from 'react';
import classnames from 'classnames'
import './card.scss'
import back from './cards/back.svg'
import { createReadStream } from 'fs';

const Card = ({ onClick, card, index }) => {
    let [isFlipped, setFlipped] = useState(false);

    const handleClick = () => {
        onClick();
        setFlipped(!isFlipped);
    };

    return (
        <div
            className={classnames("card", {
                "is-flipped": isFlipped
            })}
            onClick={handleClick}
        >
            <div className="card-face card-front-face">
                <img src={card.image} alt="card" />
            </div>
            <div className="card-face card-back-face">
                <img src={back} alt="card" />
            </div>
        </div>
    )
}

export default Card;