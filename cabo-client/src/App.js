import './App.scss';
import { useState, useEffect, useRef } from 'react';
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
    const cardRefs = useRef({});

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
            console.log(cardRefs.current)
        }
        else {
            setSelectedCards([]);
        }
    }

    const animateSwap = (card1, card2) => {
        const cardRef1 = cardRefs.current[card1];
        const cardRef2 = cardRefs.current[card2];
        let diffY = cardRef1.offsetTop - cardRef2.offsetTop;
        let diffX = cardRef1.offsetLeft - cardRef2.offsetLeft;
        console.log(cardRef1.style.transform)

        cardRef1.style.transform = `translate(-${diffX}px, -${diffY}px)`;
        cardRef2.style.transform = `translate(${diffX}px, ${diffY}px)`;

        // setTimeout(() => {
        //     cardRef1.style.transform = "";
        //     cardRef2.style.transform = "";
        // }, 300);
    }

    const handleSwap = () => {
        const [card1, card2] = selectedCards;
        const [player1Id, card1Id] = card1;
        const [player2Id, card2Id] = card2;

        animateSwap(card1, card2);

        setPlayers(prevPlayers => {
            let players = [...prevPlayers];

            let cards1 = [...players[player1Id].cards]
            let cards2 = player1Id === player2Id ? cards1 : [...players[player2Id].cards]

            const temp = cards1[card1Id];
            cards1[card1Id] = cards2[card2Id];
            cards2[card2Id] = temp;

            players[player1Id] = {...players[player1Id], cards: cards1};
            players[player2Id] = {...players[player2Id], cards: cards2};

            return players;
        });

        setSelectedCards([]);
        // socket.emit('Swap', JSON.stringify({players}));
        setTransition(true);
        setTimeout(() => setTransition(false), 500);
        // TODO Need to re-deal the cards
    }

    const saveRef = (index, ref) => cardRefs.current[index] = ref

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
                                        saveRef={saveRef}
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
