import Board from '../components/board';
import Scoreboard from '../components/scoreboard';
import styles from '../styles/game.module.css';
import {useState} from "react";
export default function Game() {
    const [score, setScore] = useState(() => 0);
    return (
        <div className={styles.game}>
            <Scoreboard score={score} />
            <Board setScore={setScore} score={score}/>
        </div>
    )
}