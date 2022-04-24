import './App.scss';
import { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import Card from './Components/Card';
import Deck from './Components/Deck';
import { cardImages } from './cards';
import styled from 'styled-components'

const StartButton = styled.button`
  height: 50px;
`;

const SwapButton = styled.button`
  height: 50px;
`;

const StyledDeck = styled.div`
    grid-column-start: 2;
    grid-row-start: 2;
    display: grid;
    width: 214px;
    height: 150px;
`;

const ENDPOINT = "http://localhost:4001";
export const socket = socketIOClient(ENDPOINT);

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function App() {
    const [response, setResponse] = useState("");
    const [players, setPlayers] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [transition, setTransition] = useState(false);
    const [deck, setDeck] = useState([]);
    const [swap, setSwap] = useState(false);
    const cardRefs = useRef({});
    const transitionTime = 600;

    useEffect(() => {
        socket.on("FromAPI", data => {
            setResponse(data);
        });

        socket.on('DealCards', data => {
            const {players, deck} = JSON.parse(data);
            setPlayers(players);
            setDeck(deck);
        });

        socket.on("ShowSwap", data => {
            // const {playrs} = JSON.parse(data);
            handleSwap();
            // setPlayers(playrs);
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (selectedCards.length === 2) {
            setTransition(true);
            handleSwap();
            socket.emit('Swap', JSON.stringify({players}));
            // setSwap(false);
        }
    }, [selectedCards]);

    const handleStartGame = () => {
        socket.emit('StartGame');
    }

    const handleCardSelect = (cardId) => {
      if (swap) {
        if (selectedCards.length < 2) {
            setSelectedCards(selectedCards => [...selectedCards, cardId]);
        } else {
            setSelectedCards([]);
        }
      } 
    }

    const swapCardsOnDOM = async (card1, card2) => {
        const cardRef1 = cardRefs.current[card1];
        const cardRef2 = cardRefs.current[card2];
        const diffY = Math.abs(cardRef1.offsetTop - cardRef2.offsetTop);
        const diffX = Math.abs(cardRef1.offsetLeft - cardRef2.offsetLeft);
        
        const diffY1 = cardRef1.offsetTop > cardRef2.offsetTop ? -diffY : diffY;
        const diffX1 = cardRef1.offsetLeft > cardRef2.offsetLeft ? -diffX : diffX;

        cardRef1.setAttribute("style", `transform: translate(${diffX1}px, ${diffY1}px); transition: 0s;`);
        cardRef2.setAttribute("style", `transform: translate(${-diffX1}px, ${-diffY1}px); transition: 0s;`);

        await sleep(50); // this is needed to make sure the style attribute is actually added
        cardRef1.removeAttribute("style");
        cardRef2.removeAttribute("style");
    }

    const handleSwap = () => {
        if (selectedCards.length === 0) return;
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

            players[player1Id] = {...players[player1Id], cards: cards1};
            players[player2Id] = {...players[player2Id], cards: cards2};

            return players;
        });

        swapCardsOnDOM(card1, card2);
        setSelectedCards([]);

        setTimeout(() => {
          setTransition(false);
          setSwap(false);
        }, transitionTime)
    }

    const saveRef = (index, ref) => cardRefs.current[index] = ref

  return (
    <div className="App">
      <header className="App-header">
      </header>
      <p>
        It's <time dateTime={response}>{response}</time>
      </p>
      <StartButton onClick={handleStartGame}>Start Game</StartButton>
      <SwapButton onClick={() => setSwap(true)}>Swap</SwapButton>

      <div className="container">
        <StyledDeck>
          <Deck
            topCard={cardImages[deck[0]]}
          />
        </StyledDeck>
        {players?.map((player, playerIdx) => (
          <div className={`player-container player-${playerIdx + 1}`}>
            {player.cards?.map((card, index) => (
              <Card
                saveRef={saveRef}
                cardImage={cardImages[card]}
                index={`${playerIdx}${index}`}
                key={`${playerIdx}${index}`}
                onClick={() => handleCardSelect(`${playerIdx}${index}`)}
                transition={transition}
                transitionTime={transitionTime}
                swap={swap}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
