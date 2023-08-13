import React, {useCallback, useEffect, useRef, useState} from "react";
import board_style from "../styles/board.module.css";
import tile_style from "../styles/tile.module.css";
import Tile from "./tile";
import {ActivePiece, EMPTY_CELL, LegalMove, Piece, ScoreNotation} from "../types/interface";
import {computerMove, getAllPossibleMoves, oppositePlayer} from "../ai/minimax";
import {clearTimeout} from "timers";
import gameover from "./gameover";
import {BoardRow} from "../redux/gameSlice";

export interface BoardProps {
    currentPlayer: 'T' | 'F' | null | undefined;
    board: (Piece | typeof EMPTY_CELL)[][];
    firstTurn: 'T' | 'F' | null | undefined;
    isPVP?: boolean;
    playerPiece: 'T' | 'F' | null | undefined;
    score: number;
    scoreSheet: ScoreNotation[];
    moveNumber: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setScoreSheet: React.Dispatch<React.SetStateAction<ScoreNotation[]>>;
    setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
    setBoard: React.Dispatch<React.SetStateAction<(Piece | typeof EMPTY_CELL)[][]>>;
    setCurrentPlayer: React.Dispatch<React.SetStateAction<'T' | 'F' | null | undefined>>;
    setMoveNumber: React.Dispatch<React.SetStateAction<number>>;
}

const operations: string[][] = [
    ['', '⇐', '', '↑', '', '⊻', '', '¬'],
    ['⊻', '', '↑', '', '∨', '', '⇐', ''],
    ['', '↓', '', '∨', '', '⇔', '', '⇐'],
    ['↓', '', '∧', '', '⇔', '', '∨', ''],
    ['', '∧', '', '⇔', '', '∨', '', '↑'],
    ['⇐', '', '⇔', '', '∧', '', '↑', ''],
    ['', '⇐', '', '∧', '', '↓', '', '⊻'],
    ['¬', '', '⊻', '', '↓', '', '⇐', '']
];

// Initialize the board
export const initializeBoard = () => {
    const board: (Piece | typeof EMPTY_CELL)[][] = Array.from({ length: 8 }, () => Array(8).fill(EMPTY_CELL));
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if ((x + y) % 2 === 1) {
                if (y < 3) {
                    board[y][x] = { image: "/pieces/piece_false_normal.png", value: 'F', x, y, isDama: false, isPiece: true };
                } else if (y > 4) {
                    board[y][x] = { image: "/pieces/piece_true_normal.png", value: 'T', x, y, isDama: false, isPiece: true };
                }
            }

        }
    }

    return board;
};

const isValidSquare = (x: number, y: number) => {
    if(x%2 ===0 && y%2 ===0) { // Both even
        return false;
    }
    return !(y % 2 === 1 && x % 2 === 1); // Both odd
}

// Game over flag
let gameOver = false;

// Actual board object
const Board: React.FC<BoardProps> = ({score,
                                         setScore,
                                         scoreSheet,
                                         setScoreSheet,
                                         playerPiece,
                                         isPVP,
                                         setIsGameOver,
                                         board,
                                         setBoard,
                                         firstTurn,
                                         currentPlayer,
                                         setCurrentPlayer,
                                         moveNumber,
                                         setMoveNumber
                                     }) => {
    const [activePiece, setActivePiece] = useState<ActivePiece | null>(() => null);
    const [activePiecePosition, setActivePiecePosition] = useState<{ x: number; y: number } | null>(() =>null);
    const [isDragging, setIsDragging] = useState(() => false);
    const [legalMoves, setLegalMoves] = useState<LegalMove[]>(() => []);
    const [isLoading, setIsLoading] = useState(() => false);
    const [moveScore, setMoveScore] = useState(()=> 0);
    const [computerPlayer, setComputerPlayer] = useState<'T' | 'F'>(() => (currentPlayer==='T' ? 'F' : 'T'));
    const [prevMove, setPrevMove] = useState<{ capture: boolean; type: string } | null>(() => null);
    const [computerTurn, setComputerTurn] = useState(() => false);
    const boardRef = useRef<HTMLDivElement>(null);
    const offset = 80;

    const fetchCanCapture = useCallback(async (selectedPiece: Piece, board: (Piece | typeof EMPTY_CELL)[][], currentPlayer: 'F' | 'T') => {
        try {
            const response = await fetch('/api/get-force-capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({selectedPiece, board, currentPlayer })
            });
            const { canCapture, selectedPieceCaptures } = await response.json();
            return { canCapture, selectedPieceCaptures };
        } catch (error) {
            console.error('Error fetching scores:', error);
            return { canCapture: false, selectedPieceCaptures: false }; // return a default object when there is an error
        }
    }, []);

    const fetchLegalMoves = useCallback(async (piece: Piece, board: (Piece | typeof EMPTY_CELL)[][]) => {
        try {
            const response = await fetch('/api/get-legal-moves', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ piece, board })
            });

            const { legalMoves } = await response.json();

            // Set the legal moves
            setLegalMoves(legalMoves);

            return legalMoves;
        } catch (error) {
            console.error('Error fetching legal moves:', error);
            return [];
        }
    }, []);

    const fetchScores = useCallback(async ( piece: Piece, operand: string, oldX: number, oldY: number, newX: number, newY: number, oldScore: number) => {
        try {

            const response = await fetch('/api/get-scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({piece, operand, score: oldScore})
            });
            const { score: updatedScore, moveScore: turnScore } = await response.json();

            // After updating the score, update the scoreSheet
            let calculation = '';
            let oppositePiece = (piece.value === 'T') ? 'F' : 'T';
            let newScore = (score === updatedScore) ? score : updatedScore;
            let newMoveNumber = moveNumber;

            if(Math.abs(newX - oldX) === 2 && Math.abs(newY - oldY) === 2) {
                calculation += `${piece.value} ${operations[newY][newX]} ${oppositePiece}`;
            }
            if(oldX !== newX && oldY !== newY && isPVP) {
                newMoveNumber = newMoveNumber + 1;
                console.log("Old move number", moveNumber);
                console.log("New move number", newMoveNumber);
                const newScoreNotation: ScoreNotation = {
                    moveNumber: newMoveNumber,
                    source: { x: oldX, y: oldY },
                    dest: { x: newX, y: newY },
                    calculation: calculation,
                    score: turnScore,
                    total: newScore
                };

                const updatedScoreSheet = [...scoreSheet, newScoreNotation];
                setScoreSheet(updatedScoreSheet);
                // Update move number in Board state
                setMoveNumber(newMoveNumber);
            }

            // Set the updated score
            setScore(updatedScore);
            setMoveScore(turnScore);

            // Return the updated score and turn score
            return { score: updatedScore, moveScore: turnScore };
        } catch (error) {
            console.error('Error fetching scores:', error);
            return { score: score, moveScore: 0 };
        }
    }, [moveNumber, score]); // move number

    const grabPiece = useCallback(async (e: React.MouseEvent) => {
        // let tempBoard = board.map((row: BoardRow) => [...row]);
        console.log(isDragging, isLoading, playerPiece, currentPlayer);
        if (!isDragging && !isLoading && playerPiece === currentPlayer) {
            setIsLoading(true);
            e.preventDefault();
            const element = e.target as HTMLElement;
            const boardElement = boardRef.current;
            if (element.classList.contains(tile_style.piece) && boardElement) {
                const x = Math.abs(Math.floor((e.clientX - boardElement.offsetLeft) / offset));
                const y = Math.abs( Math.floor((e.clientY - boardElement.offsetTop) / offset));

                const foundPiece = board[y][x];

                if (foundPiece && foundPiece.value === currentPlayer && foundPiece.isPiece && isValidSquare(x,y)) {
                    console.log(`Found piece: ${foundPiece.value}`);
                    // Set states
                    setActivePiece({piece: foundPiece, index: {x, y}});
                    setIsDragging(true);  // Set isDragging to true

                    // Fetch legal moves
                    const result = await fetchCanCapture(foundPiece, board, currentPlayer);
                    const canCapture = result.canCapture;
                    const selectedPieceCaptures = result.selectedPieceCaptures;

                    // Only show legalMoves for forced captures and no captures
                    if (canCapture && selectedPieceCaptures) {
                        await fetchLegalMoves(foundPiece, board);
                    } else if (!canCapture) {
                        await fetchLegalMoves(foundPiece, board);
                    }
                    // else if (canCapture && !selectedPieceCaptures) {
                    //     // break
                    // }
                }
            }
        }
        setIsLoading(false);
    }, [isDragging, playerPiece, isLoading, currentPlayer]);

    const dropPiece = useCallback(async () => {
        if ((activePiece && activePiecePosition && !isLoading) && playerPiece === currentPlayer) {
            setIsLoading(true);
            const {x: newX, y: newY} = activePiecePosition;
            const {x: oldX, y: oldY} = activePiece.index;
            let isCapture = false;
            let isDama = false;
            const isLegalMove = legalMoves.some(move => move.x === newX && move.y === newY);
            let newMoveNumber = moveNumber;
            let movedPiece = {...activePiece.piece, x: newX, y: newY};

            // Check for promotion to Dama
            if (movedPiece.value === 'T' && newY === 0 && !movedPiece.isDama) {
                movedPiece.isDama = true;
                movedPiece.image = "/pieces/piece_true_dama.png"; // Update image to reflect promotion
            } else if (movedPiece.value === 'F' && newY === 7 && !movedPiece.isDama) {
                movedPiece.isDama = true;
                movedPiece.image = "/pieces/piece_false_dama.png"; // Update image to reflect promotion
            }

            if (isLegalMove) {
                const updatedBoard = JSON.parse(JSON.stringify(board));
                // Check if the move is a capturing move
                if (Math.abs(newX - oldX) === 2 && Math.abs(newY - oldY) === 2) {
                    // Find the captured piece
                    const capturedX = (newX + oldX) / 2;
                    const capturedY = (newY + oldY) / 2;

                    // Remove the captured piece from the board
                    updatedBoard[capturedY][capturedX] = EMPTY_CELL;

                    // Calculate score here
                    isCapture = true;
                }

                updatedBoard[newY][newX] = movedPiece;
                updatedBoard[oldY][oldX] = EMPTY_CELL;
                console.log("New X: ", newX, "New Y: ", newY);
                setBoard(updatedBoard);

                // After making a move, fetch the legal moves for the moved piece again
                const updatedPiece = {...movedPiece};
                const newLegalMoves = await fetchLegalMoves(updatedPiece, board);

                // Check if there are more captures available
                const canCapture = newLegalMoves.some((move: { x: number, y: number }) => Math.abs(move.x - newX) === 2 && Math.abs(move.y - newY) === 2);

                let newPrevMove;
                // If it's a capture move, calculate the scores
                if (isCapture) {
                    await fetchScores(activePiece.piece, operations[newY][newX], oldX, oldY, newX, newY, score);
                    newPrevMove = {capture: true, type: activePiece.piece.value}
                } else {
                    newPrevMove = {capture: false, type: activePiece.piece.value}
                }

                // Only change currentPlayer if there are no more captures, and it's not a consecutive capture
                if ((!canCapture) ||
                    (canCapture && !newPrevMove.capture) ||
                    (canCapture && newPrevMove.capture && newPrevMove.type !== activePiece.piece.value))
                {
                    // (isCapture && prevMove?.capture && prevMove?.type !== activePiece.piece.value) ||
                    const updatedCurrentPlayer = currentPlayer === 'T' ? 'F' : 'T';
                    setCurrentPlayer(updatedCurrentPlayer);
                    setActivePiece(null);
                }
            } else {
                const updatedBoard = JSON.parse(JSON.stringify(board));
                updatedBoard[oldY][oldX] = activePiece.piece;
                setBoard(updatedBoard);
            }

            // After making a move, update the scoreSheet (This is for normal moves)
            // See update of scoreSheet with capture in fetchScores function

            if (!isCapture && oldX !== newX && oldY !== newY && isValidSquare(newX, newY) && isLegalMove) {
                newMoveNumber = moveNumber + 1;
                const newScoreNotation: ScoreNotation = {
                    moveNumber: newMoveNumber,
                    source: { x: oldX, y: oldY },
                    dest: { x: newX, y: newY },
                    calculation: '',
                    score: 0,
                    total: score
                };
                const updatedScoreSheet =  [...scoreSheet, newScoreNotation]
                setScoreSheet(updatedScoreSheet);
                // Update move number in Board state
                setMoveNumber(newMoveNumber);
            }
        }

        // setActivePiece(null);
        setIsLoading(false);
        setLegalMoves([]);
        setActivePiecePosition(null);
        setIsDragging(false);  // Set isDragging back to false
    }, [activePiece, activePiecePosition, isLoading, currentPlayer]);

    const movePiece = useCallback((e: MouseEvent) => {
        if (activePiece && (playerPiece === currentPlayer)) {  // Only move the piece if it was grabbed
            const boardElement = boardRef.current;
            if (boardElement) {
                const x = Math.abs(Math.floor((e.clientX - boardElement.offsetLeft) / offset));
                const y = Math.abs(Math.floor((e.clientY - boardElement.offsetTop) / offset));

                if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                    setActivePiecePosition({ x, y });
                }

                if (e.buttons === 0) {  // Check if the mouse button is not pressed
                    dropPiece().catch((error) => {
                        console.error(error);
                    })
                }
            }
        }
    }, [activePiece, dropPiece, currentPlayer]);

    useEffect(() => {
        let gameOverFlag = 0;
        console.log("GAMEOVERRRRRRR?");
        const checkGameOver = async() => {
            // Count the pieces for each player
            const tPieces = board.flat().filter(piece => piece?.value === 'T').length;
            const fPieces = board.flat().filter(piece => piece?.value === 'F').length;

            if (tPieces === 0 || fPieces === 0) {
                // One of the players has no more pieces left
                console.log("GAME OVER THERE IS NO MORE PIECES LEFT")
                setIsGameOver(true);
            }

            // Check if the game reaches move 100
            // TODO: Check average game moves, add 30 to that, that's the limit
            if (moveNumber === 70) {
                console.log("GAME OVER BECAUSE OF MOVES")
                setIsGameOver(true);
            }

            // Check if the current player has any legal moves
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {

                    // TODO: Untested 8-7-23 0526H
                    if(!isValidSquare(x, y)) continue;

                    const piece = board[y][x];
                    if (piece && piece.value === currentPlayer) {
                        const legalMoves = await fetchLegalMoves(piece, board);
                        if (legalMoves.length > 0) {
                            // The current player has at least one legal move
                            setIsGameOver(false);
                            gameOverFlag++;
                        }
                    }
                }
            }

            setIsGameOver(gameOverFlag === 0);
        }
        checkGameOver();
    }, [moveNumber, scoreSheet, currentPlayer]);

    useEffect(() => {
        // Delay before executing the computer move
        const delay = 1000; // 1 second
        let isCancelled = false;
        let prevBestMove = null;

        const doComputerMove = async () => {
            const timeoutId = setTimeout(async () => {
                if (!isCancelled && (currentPlayer === computerPlayer) && !isPVP) {
                    let totalTurnScore = 0; // Track the total score for the turn
                    let newBoard = JSON.parse(JSON.stringify(board)); // Create a copy of the current board
                    let bestMove = computerMove(newBoard, computerPlayer);
                    prevBestMove = bestMove;
                    let initialSource = bestMove?.source; // Store the initial source of the move
                    let finalDest: LegalMove | null = null; // To store the final destination of the move
                    let newScoreSheet = [...scoreSheet];
                    let newMoveNumber = moveNumber;
                    let newScore = score;
                    let flag = true;
                    let calculation = '';
                    let oppositePiece = oppositePlayer(computerPlayer);
                    let isCapture = false;
                    while (flag && bestMove) {
                        // Get the piece at the source
                        const piece = newBoard[bestMove.source.y][bestMove.source.x];
                        if (piece) {
                            // Create a temporary copy of the piece with updated coordinates
                            let tempPiece: Piece = { ...piece, x: bestMove.dest.x, y: bestMove.dest.y };

                            // Check if the move is a capturing move
                            isCapture = Math.abs(bestMove.dest.x - bestMove.source.x) === 2 && Math.abs(bestMove.dest.y - bestMove.source.y) === 2;

                            let { source, dest } = bestMove;
                            if (isCapture) {
                                // Find the captured piece
                                const capturedX = (bestMove.dest.x + bestMove.source.x) / 2;
                                const capturedY = (bestMove.dest.y + bestMove.source.y) / 2;

                                // Remove the captured piece from the board
                                newBoard[capturedY][capturedX] = EMPTY_CELL;

                                if(Math.abs(dest.x - source.x) === 2 && Math.abs(dest.y - source.y) === 2) {
                                    calculation += `${piece.value} ${operations[dest.y][dest.x]} ${oppositePiece}`;
                                }
                                // Call fetchScores with appropriate parameters
                                await fetchScores(piece, operations[dest.y][dest.x], source.x, source.y, dest.x, dest.y, newScore)
                                    .then(({ score: updatedScore , moveScore: turnScore }) => {
                                        newMoveNumber = newMoveNumber + 1;
                                        const newScoreNotation: ScoreNotation = {
                                            moveNumber: newMoveNumber,
                                            source: source,
                                            dest: dest,
                                            calculation: calculation,
                                            score: turnScore,
                                            total: updatedScore
                                        };
                                        totalTurnScore+=turnScore;
                                        newScore = updatedScore;
                                        newScoreSheet.push(newScoreNotation);
                                    });
                            } else {
                                newMoveNumber = newMoveNumber + 1;
                                const newScoreNotation: ScoreNotation = {
                                    moveNumber: newMoveNumber,
                                    source: source,
                                    dest: dest,
                                    calculation: calculation,
                                    score: 0,
                                    total: score
                                };
                                const updatedScoreSheet =  [...scoreSheet, newScoreNotation]
                                setScoreSheet(updatedScoreSheet);
                                // Update move number in Board state
                                setMoveNumber(newMoveNumber);
                            }

                            // Check for promotion to Dama
                            if (tempPiece.value === 'T' && bestMove.dest.y === 0 && !tempPiece.isDama) {
                                tempPiece.isDama = true;
                                tempPiece.image = "/pieces/piece_true_dama.png"; // Update image to reflect promotion
                            } else if (tempPiece.value === 'F' && bestMove.dest.y === 7 && !tempPiece.isDama) {
                                tempPiece.isDama = true;
                                tempPiece.image = "/pieces/piece_false_dama.png"; // Update image to reflect promotion
                            }

                            // Move the piece to the destination and clear the source
                            newBoard[bestMove.dest.y][bestMove.dest.x] = tempPiece;
                            newBoard[bestMove.source.y][bestMove.source.x] = EMPTY_CELL;
                            // Update the board
                            setBoard(newBoard);

                            // Store the final destination of the move if it's valid
                            if (bestMove) finalDest = bestMove.dest;

                            // Check if there are more captures available
                            const canCapture = getAllPossibleMoves(computerPlayer, newBoard).some(
                                (move) => Math.abs(move.dest.x - move.source.x) === 2 && Math.abs(move.dest.y - move.source.y) === 2
                            );
                            // Continue with the next capture if available
                            if (canCapture && isCapture) {
                                calculation = '';
                                bestMove = computerMove(newBoard, computerPlayer, tempPiece);
                                console.log("BEST MOVE", bestMove);
                                if (bestMove !=null && !isValidSquare(bestMove.dest.x, bestMove.dest.y)) {
                                    flag = false;
                                    bestMove = null;
                                    console.log(" I STOPPED THE BUG HERE ");
                                }
                            } else {
                                flag = false;
                                bestMove = null; // End the loop
                            }
                        }
                    }

                    // Switch to the human player's turn
                    const updatedCurrentPlayer = currentPlayer === 'T' ? 'F' : 'T';
                    setCurrentPlayer(updatedCurrentPlayer);
                    if(isCapture) {
                       setScoreSheet(newScoreSheet);
                    }
                    setMoveNumber(newMoveNumber);
                    setScore(newScore); // Update the total score
                }

                setIsLoading(false);
                setLegalMoves([]);
                setActivePiecePosition(null);
            }, delay);

            // Cleanup function
            return () => {
                isCancelled = true; // Mark the effect as cancelled
                clearTimeout(timeoutId); // Clear the timeout
            };
        }
        if ((currentPlayer === computerPlayer) && !isPVP && moveNumber !== 0) {
            console.log("Computer move");
            doComputerMove();
        }
    }, [currentPlayer, isPVP]);

    useEffect(() => {
        const boardElement = boardRef.current;

        if (boardElement) {
            boardElement.addEventListener('mousemove', movePiece);
            boardElement.addEventListener('mouseup', dropPiece);

            return () => {
                boardElement.removeEventListener('mousemove', movePiece);
                boardElement.removeEventListener('mouseup', dropPiece);
            };
        }
    }, [movePiece, dropPiece, board]);


    // Board rendering
    const renderBoard = [];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            // if(!isValidSquare(x, y)) continue;
            const cellNum = x + y + 2;
            const currentPiece = board[y][x];
            const isActivePiece = activePiece?.piece === currentPiece;
            const pieceX = isActivePiece && activePiecePosition ? activePiecePosition.x : x;
            const pieceY = isActivePiece && activePiecePosition ? activePiecePosition.y : y;


            let isLegalMove : boolean;
            if(isPVP) {
                isLegalMove = legalMoves.some(move => move.x === x && move.y === y);
            } else {
                isLegalMove = currentPlayer !== computerPlayer && legalMoves.some(move => move.x === x && move.y === y);
            }
            let displayLegalMoves = isLegalMove && isDragging;

            renderBoard.push(
                <Tile
                    key={`${x},${y}`}
                    image={currentPiece?.image}
                    type={cellNum}
                    // isPiece={currentPiece.isPiece}
                    isLegalMove={displayLegalMoves}
                    x={pieceX}
                    y={pieceY}
                    operand={operations[y][x]}
                />
            );
        }
    }

    return (
        <div
            onMouseDown={grabPiece}
            className={board_style.board}
            ref={boardRef}
        >
            {renderBoard}
        </div>
    );
};

export default Board;
// 08-04-2023 - 0240AM