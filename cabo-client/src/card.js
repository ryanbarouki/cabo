import React, { useEffect } from 'react'
import { useState } from 'react';
import classnames from 'classnames'
import './card.scss'
import back from './cards/back.svg'
import { socket } from './App.js'

const Card = ({ card, index }) => {
    let [isFlipped, setFlipped] = useState(false);

    const handleClick = () => {
        socket.emit("FlipCard", index, socket.id);
        console.log(`emit card flip index: ${index}`);
        setFlipped(!isFlipped);
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
                setFlipped(flipped => !flipped);
            }
        });
    }, []);

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