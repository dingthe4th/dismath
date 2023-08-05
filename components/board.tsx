import React, {useCallback, useEffect, useRef, useState} from "react";
import board_style from "../styles/board.module.css";
import tile_style from "../styles/tile.module.css";
import Tile from "./tile";
import {ActivePiece, LegalMove, Move, Piece, ScoreNotation} from "../types/interface";
import {computerMove, getAllPossibleMoves, MMAB, oppositePlayer} from "../ai/minimax";

export interface BoardProps {
    score: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setScoreSheet: React.Dispatch<React.SetStateAction<ScoreNotation[]>>;
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
const initializeBoard = () => {
    const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if ((x + y) % 2 === 1) {
                if (y < 3) {
                    board[y][x] = { image: "/pieces/piece_false_normal.png", value: 'F', x, y, isDama: false };
                } else if (y > 4) {
                    board[y][x] = { image: "/pieces/piece_true_normal.png", value: 'T', x, y, isDama: false };
                }
            }
        }
    }

    return board;
};

// Actual board object
const Board: React.FC<BoardProps> = ({score, setScore, setScoreSheet}) => {
    const [board, setBoard] = useState<(Piece | null)[][]>(initializeBoard());
    const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
    const [activePiecePosition, setActivePiecePosition] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [legalMoves, setLegalMoves] = useState<LegalMove[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState<'T' | 'F'>(() => Math.random() < 0.5 ? 'T' : 'F');
    const [moveScore, setMoveScore] = useState(()=> 0);
    const [moveNumber, setMoveNumber] = useState(() => 0);
    const [computerPlayer, setComputerPlayer] = useState<'T' | 'F'>(() => (currentPlayer==='T' ? 'F' : 'T'));
    const boardRef = useRef<HTMLDivElement>(null);

    const fetchCanCapture = useCallback(async (selectedPiece: Piece, board: (Piece | null)[][], currentPlayer: 'F' | 'T') => {
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

    const fetchLegalMoves = useCallback(async (piece: Piece, board: (Piece | null)[][]) => {
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

    const checkGameOver = useCallback(async (moveNumber : number) => {
        // Count the pieces for each player
        const tPieces = board.flat().filter(piece => piece?.value === 'T').length;
        const fPieces = board.flat().filter(piece => piece?.value === 'F').length;

        if (tPieces === 0 || fPieces === 0) {
            // One of the players has no more pieces left
            return true;
        }

        // Check if the game reaches move 100
        // TODO: Check average game moves, add 30 to that, that's the limit
        if (moveNumber === 70) {
            return true;
        }

        // Check if the current player has any legal moves
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = board[y][x];
                if (piece && piece.value === currentPlayer) {
                    const legalMoves = await fetchLegalMoves(piece, board);
                    if (legalMoves.length > 0) {
                        // The current player has at least one legal move
                        return false;
                    }
                }
            }
        }

        // The current player has no legal moves
        return true;
    }, [board, fetchLegalMoves, currentPlayer]);

    const fetchScores = useCallback(async ( piece: Piece, operand: string, oldX: number, oldY: number, newX: number, newY: number) => {
        try {
            const response = await fetch('/api/get-scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({piece, operand, score})
            });
            const { score: updatedScore, moveScore: turnScore } = await response.json();

            // After updating the score, update the scoreSheet
            let calculation = '';
            let oppositePiece = (piece.value === 'T') ? 'F' : 'T';
            let newScore = (score === updatedScore) ? score : updatedScore;

            if(Math.abs(newX - oldX) === 2 && Math.abs(newY - oldY) === 2) {
                calculation += `${piece.value} ${operations[newY][newX]} ${oppositePiece}`;
            }
            if(oldX !== newX && oldY !== newY) {
                const newScoreNotation: ScoreNotation = {
                    moveNumber: moveNumber + 1,
                    source: { x: oldX, y: oldY },
                    dest: { x: newX, y: newY },
                    calculation: calculation,
                    score: turnScore,
                    total: newScore
                };

                setScoreSheet(prevScoreSheet => [...prevScoreSheet, newScoreNotation]);
                // Update move number in Board state
                setMoveNumber(old => moveNumber + 1);
                // Check if game over
                const isGameOver = await checkGameOver(moveNumber + 1);
                if (isGameOver) {
                    console.log("Game over boss - WITH CAPTURE");
                }
            }
            // Set the updated score
            setScore(oldScore => updatedScore);
            setMoveScore(oldScore => turnScore);

        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    }, [setScore, score, setMoveScore, setScoreSheet, moveNumber, checkGameOver]);

    const grabPiece = useCallback(async (e: React.MouseEvent) => {
        if (!isDragging && !isLoading) {
            setIsLoading(true);
            e.preventDefault();
            const element = e.target as HTMLElement;
            const boardElement = boardRef.current;
            if (element.classList.contains(tile_style.piece) && boardElement) {
                const x = Math.floor((e.clientX - boardElement.offsetLeft) / 100);
                const y = Math.floor((e.clientY - boardElement.offsetTop) / 100);

                const foundPiece = board[y][x];

                if (foundPiece && foundPiece.value === currentPlayer) {
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
            setIsLoading(false);
        }
    }, [isDragging, board, fetchLegalMoves, currentPlayer, fetchCanCapture, isLoading]);

    const dropPiece = useCallback(async () => {
        if ((activePiece && activePiecePosition && !isLoading)) {
            setIsLoading(true);
            const {x: newX, y: newY} = activePiecePosition;
            const {x: oldX, y: oldY} = activePiece.index;
            let isCapture = false;
            let isDama = false;
            const isLegalMove = legalMoves.some(move => move.x === newX && move.y === newY);

            let movedPiece = {...activePiece.piece, x: newX, y: newY};

            // Check for promotion to Dama
            if (movedPiece.value === 'T' && newY === 0 && !movedPiece.isDama) {
                movedPiece.isDama = true;
                movedPiece.image = "/pieces/piece_true_dama.png"; // Update image to reflect promotion
                isDama = true;
            } else if (movedPiece.value === 'F' && newY === 7 && !movedPiece.isDama) {
                movedPiece.isDama = true;
                movedPiece.image = "/pieces/piece_false_dama.png"; // Update image to reflect promotion
                isDama = true;
            }

            if (isLegalMove) {
                setBoard(prevBoard => {
                    const updatedBoard = [...prevBoard];

                    // Check if the move is a capturing move
                    if (Math.abs(newX - oldX) === 2 && Math.abs(newY - oldY) === 2) {
                        // Find the captured piece
                        const capturedX = (newX + oldX) / 2;
                        const capturedY = (newY + oldY) / 2;

                        // Remove the captured piece from the board
                        updatedBoard[capturedY][capturedX] = null;

                        // Calculate score here
                        isCapture = true;
                    }

                    updatedBoard[newY][newX] = movedPiece;
                    updatedBoard[oldY][oldX] = null;

                    return updatedBoard;
                });

                // After making a move, fetch the legal moves for the moved piece again
                const updatedPiece = {...movedPiece};
                const newLegalMoves = await fetchLegalMoves(updatedPiece, board);

                // Check if there are more captures available
                const canCapture = newLegalMoves.some((move: { x: number, y: number }) => Math.abs(move.x - newX) === 2 && Math.abs(move.y - newY) === 2);

                let newPrevMove;
                // If it's a capture move, calculate the scores
                if (isCapture) {
                    await fetchScores(activePiece.piece, operations[newY][newX], oldX, oldY, newX, newY);
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
                    setCurrentPlayer(currentPlayer === 'T' ? 'F' : 'T');
                    setActivePiece(null);
                }
            } else {
                setBoard(prevBoard => {
                    const boardCopy = [...prevBoard];
                    boardCopy[oldY][oldX] = activePiece.piece;
                    return boardCopy;
                });
            }

            // After making a move, update the scoreSheet (This is for normal moves)
            // See update of scoreSheet with capture in fetchScores function
            if (!isCapture && oldX !== newX && oldY !== newY) {
                const newScoreNotation: ScoreNotation = {
                    moveNumber: moveNumber + 1,
                    source: { x: oldX, y: oldY },
                    dest: { x: newX, y: newY },
                    calculation: '',
                    score: 0,
                    total: score
                };
                setScoreSheet(prevScoreSheet => [...prevScoreSheet, newScoreNotation]);
                // Update move number in Board state
                setMoveNumber(old => moveNumber + 1);
            }

            // Check if game over
            const isGameOver = await checkGameOver(moveNumber + 1);
            if (isGameOver) {
                console.log("Game over boss - NO CAPTURE");
            }

        }
        // setActivePiece(null);
        setIsLoading(false);
        setLegalMoves([]);
        setActivePiecePosition(null);
        setIsDragging(false);  // Set isDragging back to false
        setMoveScore(() => 0);
    }, [activePiece, activePiecePosition, board, isLoading, legalMoves, fetchLegalMoves, fetchScores, currentPlayer, moveNumber, score, setScoreSheet, checkGameOver]);

    const movePiece = useCallback((e: MouseEvent) => {
        if (activePiece) {  // Only move the piece if it was grabbed
            const boardElement = boardRef.current;
            if (boardElement) {
                const x = Math.floor((e.clientX - boardElement.offsetLeft) / 100);
                const y = Math.floor((e.clientY - boardElement.offsetTop) / 100);

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
    }, [activePiece, dropPiece]);

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
            const cellNum = x + y + 2;
            const currentPiece = board[y][x];
            const isActivePiece = activePiece?.piece === currentPiece;

            const pieceX = isActivePiece && activePiecePosition ? activePiecePosition.x : x;
            const pieceY = isActivePiece && activePiecePosition ? activePiecePosition.y : y;

            const isLegalMove = legalMoves.some(move => move.x === x && move.y === y);

            renderBoard.push(
                <Tile
                    key={`${x},${y}`}
                    image={currentPiece?.image}
                    type={cellNum}
                    isPiece={Boolean(currentPiece)}
                    isLegalMove={isLegalMove}
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