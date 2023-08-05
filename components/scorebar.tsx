import React from 'react';
import styles from '../styles/scorebar.module.css';
import { ScoreboardProps } from '../types/interface';

const ScoreBar: React.FC<ScoreboardProps> = ({ score }) => {
    const adjustmentFactor = 4;
    const barScore = (score < 0 || score > 0) ? 50 + Math.abs(score * adjustmentFactor) : 50;

    let blackScore, whiteScore;

    if(score < 0) {
        blackScore = barScore;
        whiteScore = 100 - blackScore;
    } else {
        blackScore = 100 - barScore;
        whiteScore = barScore;
    }

    return (
        <div className={styles.scoreboard}>
            <div className={styles.black} style={{ height: `${blackScore}%` }} />
            <div className={styles.white} style={{ height: `${whiteScore}%` }} />
        </div>
    );
};

export default ScoreBar;
