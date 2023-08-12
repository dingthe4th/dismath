// redux./gameTypes.ts
import { EMPTY_CELL, GameData, Piece, ScoreNotation } from '../types/interface';
export interface GameState {
    gameData: GameData | null;
    board: (Piece | typeof EMPTY_CELL)[][];
    score: number;
    scoreSheet: ScoreNotation[];
    isGameOver: boolean;
    firstTurn: 'T' | 'F' | null | undefined;
    currentPlayer: 'T' | 'F' | null | undefined;
    isPVP: boolean;
    moveNumber: number;
}