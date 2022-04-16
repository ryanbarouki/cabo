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
    const [cardList, setCardList] = useState([]);

    useEffect(() => {
        socket.on("FromAPI", data => {
            setResponse(data);
        });

        socket.on('DealCards', rawPlayers => {
            setPlayers(JSON.parse(rawPlayers));
        });

        socket.on("ShowSwap", data => {
            const {playrs, cardList} = JSON.parse(data);
            console.log(playrs)
            console.log(cardList)
            setPlayers(playrs);
            setCardList(cardList);
        });

        return () => socket.disconnect();
    }, []);

    const handleStartGame = () => {
        socket.emit('StartGame');
    }

    const handleSwap = () => {
        let playrs = players;
        const temp = playrs[0].cards[0].slice();
        playrs[0].cards[0] = playrs[1].cards[0];
        playrs[1].cards[0] = temp;
        setPlayers(playrs);
        const cardList = [];
        for (const player of playrs) {
            for (const card of player.cards){
                cardList.push(card)
            }
        }
        console.log(cardList.join(""));
        setCardList(cardList)
        socket.emit('Swap', JSON.stringify({playrs, cardList}));
        // TODO Need to re-deal the cards
    }

    return (
        <div className="App">
            <header className="App-header">
            </header>
            <p>
                It's <time dateTime={response}>{response}</time>
            </p>
                <div className="container">
                    {players.map((player, playerIdx) => (
                        <div className={`player-container player-${playerIdx + 1}`}>
                            {player.cards.map((card, index) => (
                                    <Card
                                        cardImage={cardImages[card]}
                                        index={`${playerIdx}${index}`}
                                        key={`${playerIdx}${index}`}
                                        layout
                                    />
                            ))}
                        </div>
                    ))}
                    <button onClick={handleStartGame}>Start Game</button>
                    <button onClick={handleSwap}>Swap</button>
                </div>
        </div>
    );
}

export default App;
