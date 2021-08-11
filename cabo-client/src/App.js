import './App.scss';
import QH from './cards/QH.svg';
import KH from './cards/KH.svg';
import JH from './cards/JH.svg';
import H10 from './cards/10H.svg';
import { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import Card from './card';

const ENDPOINT = "http://localhost:4001";
export const socket = socketIOClient(ENDPOINT);

function App() {
    let uniqueCards = [
        {
            number: "Q",
            suit: "H", 
            image: QH
        },
        {
            number: "K",
            suit: "H", 
            image: KH
        },
        {
            number: "J",
            suit: "H", 
            image: JH
        },
        {
            number: "10",
            suit: "H", 
            image: H10
        }
    ]
    const [cards, setCards] = useState(uniqueCards);
    const [response, setResponse] = useState("");

    useEffect(() => {
        socket.on("FromAPI", data => {
            setResponse(data);
        });

        return () => socket.disconnect();
    }, []);

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
            </div>
        </div>
    );
}

export default App;
