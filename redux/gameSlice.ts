// redux/gameSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {initializeBoard} from "../components/board";
import {GameState} from "./gameTypes";
import {EMPTY_CELL, Piece} from "../types/interface";

const initialState: GameState = {
    gameData: null,
    board: initializeBoard(),
    score: 0,
    scoreSheet: [],
    isGameOver: false,
    firstTurn: null,
    currentPlayer: null,
    isPVP: true,
    moveNumber: 0,
};

type BoardRow = (Piece | typeof EMPTY_CELL)[];


const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGameData: (state, action) => {
            state.gameData = action.payload;
        },
        setBoard: (state, action) => {
            state.board = action.payload.map((row: BoardRow) => [...row]);
        },
        setScore: (state, action) => {
            state.score = action.payload;
        },
        setScoreSheet: (state, action) => {
            state.scoreSheet = action.payload;
        },
        setIsGameOver: (state, action) => {
            state.isGameOver = action.payload;
        },
        setFirstTurn: (state, action) => {
            state.firstTurn = action.payload;
        },
        setCurrentPlayer: (state, action) => {
            state.currentPlayer = action.payload;
        },
        setIsPVP: (state, action) => {
            state.isPVP = action.payload;
        },
        setMoveNumber: (state, action) => {
            state.moveNumber = action.payload;
        }
    },
});

export const {
    setGameData,
    setBoard,
    setScore,
    setScoreSheet,
    setIsGameOver,
    setFirstTurn,
    setCurrentPlayer,
    setIsPVP,
    setMoveNumber,
} = gameSlice.actions;

export default gameSlice.reducer;
