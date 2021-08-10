import './App.scss';
import back from './cards/back.svg'
import QH from './cards/QH.svg'
import KH from './cards/KH.svg'
import JH from './cards/JH.svg'
import H10 from './cards/10H.svg'
import { useState } from 'react';
import Card from './card'

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

    const handleCardClick = () => {
        // not implemented
    }

    return (
        <div className="App">
            <header className="App-header">
            </header>
            <div className="container">
                {cards.map((card, index) => {
                    return (
                        <Card
                            key={index}
                            card={card}
                            index={index}
                            onClick={handleCardClick}
                        />
                    )
                })}
            </div>
        </div>
    );
}

export default App;
