import Board from '../components/board';
import ScoreBar from '../components/scorebar';
import ScoreSheet from '../components/scoresheet';
import styles from '../styles/game.module.css';

import {useState} from "react";
import {ScoreNotation} from "../types/interface";

export default function Game() {
    const [score, setScore] = useState(() => 0);
    const [scoreSheet, setScoreSheet] = useState<ScoreNotation[]>(()=>[]);
    return (
        <div className={styles.game}>
            <ScoreBar score={score} />
            <Board setScore={setScore} score={score} scoreSheet={scoreSheet} setScoreSheet={setScoreSheet}/>
            <ScoreSheet scoreSheet={scoreSheet} />
        </div>
    )
}

/*
* TODO:
*  Known bugs:
*  - Sometimes, when you do weird mouse movements, you can spawn another copy of a piece
*  - (HARD TO REPLICATE) If you have multiple pieces that can capture, all of it can capture,
*  which is against the game rules theoretically, since you can only capture with one piece,
*  in which, after that selected piece ended its capture streak, the move will end. Admin note: As of
*  August 6, 2023 - This has been fixed.
* */