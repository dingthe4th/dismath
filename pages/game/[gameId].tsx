import {useDispatch, useSelector} from 'react-redux';
import debounce from "lodash.debounce";
import {
    setBoard,
    setCurrentPlayer,
    setFirstTurn,
    setGameData,
    setIsGameOver,
    setIsPVP,
    setMoveNumber,
    setScore,
    setScoreSheet,
} from '../../redux/gameSlice';
import {RootState} from "../../store";
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import {getDatabase, off, onValue, ref, remove, set} from 'firebase/database';
import Board, {initializeBoard} from '../../components/board';
import ScoreBar from '../../components/scorebar';
import ScoreSheet from '../../components/scoresheet';
import GameOverPopup from "../../components/gameover";
import styles from '../../styles/game.module.css';
import {app} from '../../firebase-config/config';
import {getAuth} from 'firebase/auth';
import PlayerDisplay from "../../components/playerdisplay";
import Link from "next/link";
import Image from "next/image";
import Loading from "../../components/loading";

export default function Game() {

    const dispatch = useDispatch();
    const router = useRouter();
    const { gameId } = router.query;
    const db = getDatabase(app);
    const roomRef = ref(db, `rooms/${gameId}`);

    const updateCurrentPlayer = (currentPlayer: string | null | undefined) => {
        if (currentPlayer !== null && currentPlayer !== undefined) {
            dispatch(setCurrentPlayer(currentPlayer));
        }
    };

    const handleRestart = () => {
        if (isGameOver) {
            // Remove the game room from the database
            remove(roomRef).then(() => {
                console.log('Game room removed');
            });
        }
        router.push('/');
    };

    const gameData = useSelector((state: RootState) => state.game.gameData);
    const board = useSelector((state: RootState) => state.game.board);
    const score = useSelector((state: RootState) => state.game.score);
    const scoreSheet = useSelector((state: RootState) => state.game.scoreSheet);
    const isGameOver = useSelector((state: RootState) => state.game.isGameOver);
    const firstTurn = useSelector((state: RootState) => state.game.firstTurn);
    const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer);
    const isPVP = useSelector((state: RootState) => state.game.isPVP);
    const moveNumber = useSelector((state: RootState) => state.game.moveNumber);
    const [isLoading, setIsLoading] = useState(false);
    const winner = score > 0 ? 'T' : (score === 0 ? 'Draw' : 'F');
    const delay = 500;

    useEffect(() => {
        if (gameId && db) {
            const unsubscribe = onValue(roomRef, (snapshot) => {
                const data = snapshot.val();

                // Handle disconnections:
                if (!data) {
                    // If data is null, the room has been deleted or does not exist
                    // console.log('Game Over: One of the players has disconnected');
                    dispatch(setIsGameOver(true));
                    return;
                }

                dispatch(setGameData(data));
                dispatch(setBoard(data.board || initializeBoard()));
                dispatch(setScore(data.score || 0));
                dispatch(setScoreSheet(data.moves || []));
                dispatch(setIsGameOver(data.isGameOver || false));
                dispatch(setFirstTurn(data.firstTurn || null));
                dispatch(setIsPVP(data.isPVP !== undefined ? data.isPVP : true));
                dispatch(setCurrentPlayer(data.currentPlayer || null));
                dispatch(setMoveNumber(data.moveNumber || 0));
            });

            return () => {
                if (roomRef) {
                    off(roomRef, 'value', unsubscribe);
                }
            };
        }
    }, [gameId, db, dispatch]);

    useEffect(() => {
        if (roomRef && gameId && gameData) {
            const debounceWrite = debounce(() => {
                setIsLoading(true); // Set loading state
                set(roomRef, {
                    ...gameData,
                    board: board,
                    score: score,
                    moves: scoreSheet,
                    isGameOver: isGameOver,
                    isPVP: isPVP,
                    currentPlayer: currentPlayer,
                    moveNumber: moveNumber,
                }).then(() => {
                    setIsLoading(false); // Clear loading state
                });
            }, delay); // Debounce time in milliseconds

            debounceWrite();

            return () => {
                debounceWrite.cancel(); // Cancel any pending debounce calls when the component unmounts
            };
        }
    }, [gameData, board, score, scoreSheet, isGameOver, isPVP, currentPlayer, gameId, roomRef, moveNumber]);

    let playerPiece =
        gameData?.player1?.uid === getAuth(app).currentUser?.uid
            ? gameData?.player1?.piece
            : gameData?.player2?.piece;

    if (!gameData) return <Loading />;

    return (
        <div className="container">
            <header className="header">
                <div className="logo">
                    <Link href="/">
                        <span>
                            <Image src="/static/default_logo.png" alt="Dismath Checkers Logo" width={50} height={50}/>
                        </span>
                    </Link>
                </div>
                <nav className="navigation">
                    <ul>
                        <li>
                            <Link href="/">Home</Link>
                        </li>
                        <li>
                            <Link href="/how-to-play">How to Play</Link>
                        </li>
                        <li>
                            <Link href="/about">About</Link>
                        </li>
                    </ul>
                </nav>
            </header>
            <div className="cover">
                <div className="overlay">
                    <div className={styles.game}>
                        {isGameOver && (
                            <GameOverPopup
                                winner={winner}
                                score={score}
                                scoreSheet={scoreSheet}
                                gameId={gameId}
                                onRestart={handleRestart}
                            />
                        )}
                        <PlayerDisplay
                            player1={gameData.player1}
                            player2={gameData.player2}
                            currentPlayer={currentPlayer}
                            isPVP={isPVP}
                        />
                        <div className={styles.boardContainer}>
                            <ScoreBar score={score} />
                            <Board
                                setScore={(value) => dispatch(setScore(value))}
                                score={score}
                                scoreSheet={scoreSheet}
                                setScoreSheet={(value) => dispatch(setScoreSheet(value))}
                                playerPiece={playerPiece}
                                isPVP={isPVP}
                                setIsGameOver={(value) => dispatch(setIsGameOver(value))}
                                board={board}
                                setBoard={(value) => dispatch(setBoard(value))}
                                firstTurn={firstTurn}
                                currentPlayer={currentPlayer}
                                setCurrentPlayer={(value) => dispatch(setCurrentPlayer(value))}
                                moveNumber={moveNumber}
                                setMoveNumber={(value) => dispatch(setMoveNumber(value))}
                            />
                            <ScoreSheet scoreSheet={scoreSheet} />
                        </div>
                    </div>
                </div>
            </div>
            <footer className="footer">
                <p>&copy; Dismath Checkers, All rights reserved.</p>
            </footer>
        </div>
    );
}