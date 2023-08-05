import styles from '../styles/scoresheet.module.css';
import { ScoreNotation } from '../types/interface';
import React from "react";

interface ScoreSheetProps {
    scoreSheet: ScoreNotation[];
}

const ScoreSheet: React.FC<ScoreSheetProps> = ({ scoreSheet }) => {
    return (
        <div className={styles.scoresheet}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>#</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Logic</th>
                    <th>Score</th>
                    <th>Total</th>
                </tr>
                </thead>
                <tbody>
                {scoreSheet.map((notation, index) => (
                    <tr key={index}>
                        <td>{notation.moveNumber}</td>
                        <td>{`(${notation.source.x}, ${notation.source.y})`}</td>
                        <td>{`(${notation.dest.x}, ${notation.dest.y})`}</td>
                        <td>{notation.calculation}</td>
                        <td>{notation.score}</td>
                        <td>{notation.total}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScoreSheet;