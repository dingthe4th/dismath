import Board from '../components/board';
import styles from '../styles/game.module.css';
export default function Game() {
    return (
        <div className={styles.game}>
            <Board />
        </div>
    )
}