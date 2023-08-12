import React from 'react';
import styles from '../styles/playerdisplay.module.css';
import { Player } from '../types/interface';

type PlayerDisplayProps = {
    player1: Player;
    player2: Player;
    currentPlayer: 'T' | 'F' | null | undefined;
    isPVP: boolean;
};

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ player1, player2, currentPlayer , isPVP}) => {
    let player1Name = player1?.email ? player1.email.split('@')[0] : 'Unknown';
    let player1Piece = player1?.piece;
    let player2Piece;
    let player2Name;

    if(isPVP) {
        player2Name = player2?.email ? player2.email.split('@')[0] : 'Unknown';
        player2Piece = player2?.piece;
    } else {
        player2Name = 'DismathAI';
        player2Piece = (player1Piece === 'T' ? 'F' : 'T');
    }
    let currentPlayerName = currentPlayer === player1Piece ? (player1Name+'(' + player1Piece + ')') : (player2Name+'(' + player2Piece + ')');

    return (
        <div className={styles.profileContainer}>
            <div className={styles.playerVs}>
                {player1Name} ({player1Piece}) vs {player2Name} ({player2Piece})
            </div>
            <div className={styles.currentTurn}>
                Current Turn: {currentPlayerName}
            </div>
        </div>
    );
};

export default PlayerDisplay;
