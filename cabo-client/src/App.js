import './App.scss';
import { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import Card from './Components/Card';
import { cardImages } from './cards'

const ENDPOINT = "http://localhost:4001";
export const socket = socketIOClient(ENDPOINT);

function App() {
    const [response, setResponse] = useState("");
    const [players, setPlayers] = useState([]);
    const [transition, setTransition] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);

    useEffect(() => {
        socket.on("FromAPI", data => {
            setResponse(data);
        });

        socket.on('DealCards', rawPlayers => {
            setPlayers(JSON.parse(rawPlayers));
        });

        socket.on("ShowSwap", data => {
            const {playrs} = JSON.parse(data);
            setPlayers(playrs);
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (selectedCards.length === 2) {
            console.log(players)
            handleSwap();
        }
    }, [selectedCards]);

    const handleStartGame = () => {
        socket.emit('StartGame');
    }

    const handleCardSelect = (cardId) => {
        if (selectedCards.length < 2) {
            setSelectedCards(selectedCards => [...selectedCards, cardId]);
        }
        else {
            setSelectedCards([]);
        }
    }

    const handleSwap = () => {
        const [card1, card2] = selectedCards;
        const [player1Id, card1Id] = card1;
        const [player2Id, card2Id] = card2;

        setPlayers(prevPlayers => {
            let players = [...prevPlayers];

            let cards1 = [...players[player1Id].cards]
            let cards2 = player1Id === player2Id ? cards1 : [...players[player2Id].cards]

            const temp = cards1[card1Id];
            cards1[card1Id] = cards2[card2Id];
            cards2[card2Id] = temp;

            console.log(cards1)
            console.log(cards2)

            players[player1Id] = {...players[player1Id], cards: cards1};
            players[player2Id] = {...players[player2Id], cards: cards2};

            console.log("players", players);
            return players;
        });

        setSelectedCards([]);
        // socket.emit('Swap', JSON.stringify({players}));
        setTransition(true);
        setTimeout(() => setTransition(false), 500);
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
                    {players?.map((player, playerIdx) => (
                        <div className={`player-container player-${playerIdx + 1}`}>
                            {player.cards?.map((card, index) => (
                                    <Card
                                        cardImage={cardImages[card]}
                                        index={`${playerIdx}${index}`}
                                        key={`${playerIdx}${index}`}
                                        transition={transition}
                                        onClick={() => handleCardSelect(`${playerIdx}${index}`)}
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
