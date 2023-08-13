import styles from '../styles/gameoverpopup.module.css';
import exportToJSON from "../utils/exportToJSON";
import {ScoreNotation} from "../types/interface";

type GameOverPopupProps = {
    winner: string;
    score: number;
    scoreSheet: ScoreNotation[];
    gameId: String | String[] | undefined;
    onRestart: () => void;
}

const GameOverPopup: React.FC<GameOverPopupProps> = ({ winner, score, scoreSheet, gameId, onRestart }) => {
    return (
        <div className={styles.popupContainer}>
            <div className={styles.popupContent}>
                <h2>Game Over!</h2>
                <p>Winner: {winner}</p>
                <p>Final Score: {score}</p>
                <button onClick={onRestart}>Play Again</button>
                <button onClick={() => exportToJSON(scoreSheet, gameId)}>Download Scoresheet</button>
            </div>
        </div>
    );
};

export default GameOverPopup;
