import './App.scss';
import { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import Card from './card';
import { cardImages } from './cards'
import { shuffle } from './utils'

const ENDPOINT = "http://localhost:4001";
export const socket = socketIOClient(ENDPOINT);

function App() {
    const cardArray = shuffle(Object.values(cardImages));
    const [cards, setCards] = useState([]); 
    const [response, setResponse] = useState("");

    useEffect(() => {
        socket.on("FromAPI", data => {
            setResponse(data);
        });

        socket.on('DealCards', rawPlayers => {
            const players = JSON.parse(rawPlayers);
            
            let images = [];
            for (const player of players) {
                const playerCards = player.cards;
                for (const card of playerCards) {
                    images.push(cardImages[card]);
                }
            }

            setCards(images);
        });

        return () => socket.disconnect();
    }, []);

    const handleStartGame = () => {
        socket.emit('StartGame');
    }

    return (
        <div className="App">
            <header className="App-header">
            </header>
            <p>
                It's <time dateTime={response}>{response}</time>
            </p>
            <div className="container">
                {cards.map((card, index) => {
                    return (
                        <Card
                            key={index}
                            card={card}
                            index={index}
                        />
                    )
                })}
                <button onClick={handleStartGame}>Start Game</button>
            </div>
        </div>
    );
}

export default App;
