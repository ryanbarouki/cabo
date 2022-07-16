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

const Button = styled.button`
  border-radius: 8px;
  border-style: solid;
  border-width: 0px;
  padding: 12px;
  font-size: 0.9rem;

  :active {
    background-color: darkgray;
  }

  @media (prefers-color-scheme: dark) {
    color: #DADADA;
    background-color: #1F2023;  

    :active {
      background-color: #000;
    }
  }
`;

const StyledDeck = styled.div`
    display: flex;
    width: 225px;
    height: 153px;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(1, 1fr);
    gap: 5px;
`;

const PlayerGrid = styled.div`
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  justify-items: center;
  align-items: stretch;
  gap: 5px;
  margin: 0 auto;
  perspective: 100%;
  max-width:1380px;
`;

const Container = styled.div`
  grid-column-start: 2;
  grid-row-start: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ENDPOINT = "http://localhost:4001";
export const socket = socketIOClient(ENDPOINT);

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const TOP_DECK = "topDeck";
const DISCARD = "disCard";

function App() {
  const [response, setResponse] = useState("");
  const [players, setPlayers] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [transition, setTransition] = useState(false);
  const [deck, setDeck] = useState([]);
  const [discardedCard, setDiscardedCard] = useState();
  const [swap, setSwap] = useState(false);
  const [flipped, setFlipped] = useState({});
  const [selectingFromDeck, setSelectingFromDeck] = useState(false);
  const cardRefs = useRef({});
  const transitionTime = 600;

  useEffect(() => {
    socket.on("ShowSwap", data => {
      const { cardsToSwap } = JSON.parse(data);
      handleSwap(cardsToSwap);
    });
  }, [flipped]);

  useEffect(() => {
    socket.on("FromAPI", data => {
      setResponse(data);
    });

    socket.on('DealCards', data => {
      const { players, deck } = JSON.parse(data);
      setPlayers(players);
      setDeck(deck);
      setFlipped(flipped => ({ ...flipped, [TOP_DECK]: true }));
      setFlipped(flipped => ({ ...flipped, [DISCARD]: false }));
      setDiscardedCard(deck[1]);
      players.forEach((player, playerId) => player.cards.forEach(
        (card, cardId) => {
          setFlipped(flipped => ({ ...flipped, [`${playerId}${cardId}`]: true }));
        }
      ));
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (selectedCards.length === 2) {
      handleSwap(selectedCards);
      socket.emit('Swap', JSON.stringify({ cardsToSwap: selectedCards }));
    }
  }, [selectedCards]);

  const handleStartGame = () => {
    socket.emit('StartGame');
  }


  const handleCardSelect = (cardId) => {
    if (selectingFromDeck) {
      if (cardId == TOP_DECK) return;
      handleDeckExchange(cardId);
      return;
    }
    if (cardId === TOP_DECK) {
      setSelectingFromDeck(true);
      setFlipped(oldFlipped => ({ ...oldFlipped, [cardId]: !oldFlipped[cardId] }));
      return;
    }
    if (swap) {
      if (selectedCards.length < 2) {
        setSelectedCards(selectedCards => [...selectedCards, cardId]);
      } else {
        setSelectedCards([]);
      }
    } else {
      setFlipped(oldFlipped => ({ ...oldFlipped, [cardId]: !oldFlipped[cardId] }));
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
    setFlipped(oldFlipped => ({ ...oldFlipped, [TOP_DECK]: true }));
    const topDeck = cardRefs.current[TOP_DECK];
    const disCard = cardRefs.current[DISCARD];
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

      players[playerId] = { ...players[playerId], cards: cards };

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

  const handleSwap = (cardsToSwap) => {
    if (cardsToSwap.length === 0) return;
    setTransition(true);
    const [card1, card2] = cardsToSwap;
    const [player1Id, card1Id] = card1;
    const [player2Id, card2Id] = card2;

    setPlayers(prevPlayers => {
      let players = [...prevPlayers];

      let cards1 = [...players[player1Id].cards]
      let cards2 = player1Id === player2Id ? cards1 : [...players[player2Id].cards]

      const temp = cards1[card1Id];
      cards1[card1Id] = cards2[card2Id];
      cards2[card2Id] = temp;

      players[player1Id] = { ...players[player1Id], cards: cards1 };
      players[player2Id] = { ...players[player2Id], cards: cards2 };

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
      <Button onClick={handleStartGame}>Start Game</Button>

      <PlayerGrid>
        {deck.length > 0 &&
        <Container>

          <StyledDeck>
            {/* <Deck /> */}
            <Card
              cardImage={cardImages[deck[0]]}
              index="00"
              saveRef={ref => saveRef(TOP_DECK, ref)}
              onClick={() => handleCardSelect(TOP_DECK)}
              transition={transition}
              transitionTime={transitionTime}
              flipped={flipped[TOP_DECK]}
            />
            <Card
              cardImage={cardImages[discardedCard]}
              index="01"
              saveRef={ref => saveRef(DISCARD, ref)}
              onClick={() => { }}
              transition={transition}
              transitionTime={transitionTime}
              flipped={flipped[DISCARD]}
            />
          </StyledDeck>
          <Button onClick={() => setSwap(true)}>Swap</Button>
        </Container>
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
      </PlayerGrid>
    </div>
  );
}

export default App;
