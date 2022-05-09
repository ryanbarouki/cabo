import './App.scss';
import { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import Card from './Components/Card';
import Deck from './Components/Deck';
import { cardImages } from './cards';
import styled from 'styled-components'
import back from './cards/back.svg';

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
    width: 225px;
    height: 153px;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(1, 1fr);
    gap: 5px;
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
    const [discardedCard, setDiscardedCard] = useState();
    const [topDeckCard, setTopDeckCard] = useState();
    const [swap, setSwap] = useState(false);
    const [flipped, setFlipped] = useState({});
    const [selectingFromDeck, setSelectingFromDeck] = useState(false);
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
            setFlipped(flipped => ({...flipped, ["topDeck"]: true}));
            setFlipped(flipped => ({...flipped, ["disCard"]: false}));
            setDiscardedCard(deck[1]);
            players.forEach((player, playerId) => player.cards.forEach(
              (card, cardId) => {
                setFlipped(flipped => ({...flipped, [`${playerId}${cardId}`]: true}));
              }
            ));
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
      if (selectingFromDeck) {
        handleDeckExchange(cardId);
        return;
      }
      if (cardId === "topDeck") {
        setSelectingFromDeck(true);
        setFlipped(oldFlipped => ({...oldFlipped, [cardId]: !oldFlipped[cardId]}));
        return;
      }
      if (swap) {
        if (selectedCards.length < 2) {
          setSelectedCards(selectedCards => [...selectedCards, cardId]);
        } else {
          setSelectedCards([]);
        }
      } else {
        setFlipped(oldFlipped => ({...oldFlipped, [cardId]: !oldFlipped[cardId]}));
      }

    }

    const cardAnimationStyle = (diffX, diffY, flipped) => {
      return `transform: translate(${diffX}px, ${diffY}px) ${flipped ? "rotateY(180deg)" : "rotateY(0deg)"}; transition: 0s;`
    }

    const cardAnimationStyleNoTransition = (diffX, diffY, flipped) => {
      return `transform: translate(${diffX}px, ${diffY}px) ${flipped ? "rotateY(180deg)" : "rotateY(0deg)"};`;
    }

    const handleDeckExchange = async (cardId) => {
      setTransition(true);
      setFlipped(oldFlipped => ({...oldFlipped, ["topDeck"]: true}));
      const topDeck = cardRefs.current["topDeck"];
      const disCard = cardRefs.current["disCard"];
      const playerCard = cardRefs.current[cardId];
      const diffYPlayer = Math.abs(disCard.offsetTop - playerCard.offsetTop);
      const diffXPlayer = Math.abs(disCard.offsetLeft - playerCard.offsetLeft);

      const diffYDeck = Math.abs(topDeck.offsetTop - playerCard.offsetTop);
      const diffXDeck = Math.abs(topDeck.offsetLeft - playerCard.offsetLeft);

      const diffY1Player = playerCard.offsetTop > disCard.offsetTop ? -diffYPlayer : diffYPlayer;
      const diffX1Player = playerCard.offsetLeft > disCard.offsetLeft ? -diffXPlayer : diffXPlayer;

      const diffY1Deck = topDeck.offsetTop > playerCard.offsetTop ? -diffYDeck : diffYDeck;
      const diffX1Deck = topDeck.offsetLeft > playerCard.offsetLeft ? -diffXDeck : diffXDeck;

      playerCard.setAttribute("style", cardAnimationStyleNoTransition(diffX1Player, diffY1Player, false));
      topDeck.setAttribute("style", cardAnimationStyleNoTransition(diffX1Deck, diffY1Deck, true));

      await sleep(transitionTime); 
      setTransition(false);
      const [playerId, card] = cardId;
      setPlayers(prevPlayers => {
          let players = [...prevPlayers];
          let cards = [...players[playerId].cards];

          const temp = cards[card];
          cards[card] = deck[0];
          setDiscardedCard(temp);

          players[playerId] = {...players[playerId], cards: cards};

          return players;
      });
      setDeck(oldDeck => oldDeck.slice(1))
      playerCard.setAttribute("style", cardAnimationStyle(0, 0, flipped[cardId]));
      topDeck.setAttribute("style", cardAnimationStyle(0, 0, true));
      await sleep(50); // this is needed to make sure the style attribute is actually added
      playerCard.removeAttribute("style");
      topDeck.removeAttribute("style");
      setSelectingFromDeck(false);
    }

    const swapCardsOnDOM = async (card1, card2) => {
        const cardRef1 = cardRefs.current[card1];
        const cardRef2 = cardRefs.current[card2];
        const diffY = Math.abs(cardRef1.offsetTop - cardRef2.offsetTop);
        const diffX = Math.abs(cardRef1.offsetLeft - cardRef2.offsetLeft);
        
        const diffY1 = cardRef1.offsetTop > cardRef2.offsetTop ? -diffY : diffY;
        const diffX1 = cardRef1.offsetLeft > cardRef2.offsetLeft ? -diffX : diffX;

        cardRef1.setAttribute("style", cardAnimationStyle(diffX1, diffY1, flipped[card1]));
        cardRef2.setAttribute("style", cardAnimationStyle(-diffX1, -diffY1, flipped[card2]));

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
        {deck.length > 0 && 
          <StyledDeck>
            <Deck/>
            <Card
              cardImage={cardImages[deck[0]]}
              index="00"
              saveRef={ref => saveRef("topDeck", ref)}
              onClick={() => handleCardSelect("topDeck")}
              transition={transition}
              transitionTime={transitionTime}
              flipped={flipped["topDeck"]}
            />
            <Card
              cardImage={cardImages[discardedCard]}
              index="01"
              saveRef={ref => saveRef("disCard", ref)}
              onClick={() => {}}
              transition={transition}
              transitionTime={transitionTime}
              flipped={flipped["disCard"]}
            />
          </StyledDeck>
        }
        {players?.map((player, playerIdx) => (
          <div className={`player-container player-${playerIdx + 1}`}>
            {player.cards?.map((card, index) => (
              <Card
                saveRef={ref => saveRef(`${playerIdx}${index}`, ref)}
                cardImage={cardImages[card]}
                index={`${playerIdx}${index}`}
                key={`${playerIdx}${index}`}
                onClick={() => handleCardSelect(`${playerIdx}${index}`)}
                transition={transition}
                transitionTime={transitionTime}
                flipped={flipped[`${playerIdx}${index}`]}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
