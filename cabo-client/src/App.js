import './App.scss';
import { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import Card from './card';
import { cardImages } from './cards'

const ENDPOINT = "http://localhost:4001";
export const socket = socketIOClient(ENDPOINT);

function App() {
    const [response, setResponse] = useState("");
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        socket.on("FromAPI", data => {
            setResponse(data);
        });

        socket.on('DealCards', rawPlayers => {
            const players = JSON.parse(rawPlayers);
            
            for (const player of players) {
                const playerCards = player.cards;
                player.cardImages = [];
                for (const card of playerCards) {
                    player.cardImages.push(cardImages[card]);
                }
            }

            setPlayers(players);
        });

        return () => socket.disconnect();
    }, []);

    const handleStartGame = () => {
        socket.emit('StartGame');
    }

    const handleDragEnd = (result) => {
        console.log(result);
    }

    const handleDragUpdate = (result) => {
        if (result.destination === null) {
            return;
        }
        
        console.log(result);
    }

    return (
        <div className="App">
            <header className="App-header">
            </header>
            <p>
                It's <time dateTime={response}>{response}</time>
            </p>
            <div className="container">
                {players.map((player, playerIdx) => {
                    return (
                        <div className={`player-container player-${playerIdx+1}`}>
                            {player.cardImages.map((card, index) => {
                                return (
                                    <Card
                                        key={index}
                                        card={card}
                                        index={`${playerIdx}${index}`}
                                    />
                                )
                            })}
                        </div>
                    )
                })}
                <button onClick={handleStartGame}>Start Game</button>
            </div>
        </div>
    );
}

export default App;
