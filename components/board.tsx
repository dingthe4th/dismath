import React, { useCallback, useEffect, useRef, useState } from "react";
import board_style from "../styles/board.module.css";
import tile_style from "../styles/tile.module.css";
import Tile from "./tile";

interface Piece {
    image: string;
    value: string;
    x: number;
    y: number;
    isPiece?: boolean;
    isDama?: boolean;
}

interface ActivePiece {
    piece: Piece;
    index: { x: number, y: number };
}

interface LegalMove {
    x: number; // x coordinate
    y: number; // y coordinate
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
const Board = () => {
    const [board, setBoard] = useState<(Piece | null)[][]>(initializeBoard());
    const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
    const [activePiecePosition, setActivePiecePosition] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [legalMoves, setLegalMoves] = useState<LegalMove[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [score, setScore] = useState(() => 0);
    const [currentPlayer, setCurrentPlayer] = useState<'T' | 'F'>(() => Math.random() < 0.5 ? 'T' : 'F');
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


    const fetchScores = useCallback(async ( piece: Piece, operand: string) => {
        try {
            const response = await fetch('/api/get-scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({piece, operand, score})
            });
            const { score: updatedScore } = await response.json();

            // Set the updated score
            setScore(updatedScore);

        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    }, [score]);


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


    const grabPiece = useCallback(async (e: React.MouseEvent) => {
        if (!isDragging) {
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
                    const result = await fetchCanCapture(foundPiece,board, currentPlayer);
                    const canCapture = result.canCapture;
                    const selectedPieceCaptures = result.selectedPieceCaptures;
                    console.log(canCapture, selectedPieceCaptures);

                    if (canCapture && selectedPieceCaptures) {
                        await fetchLegalMoves(foundPiece, board);
                    } else if (canCapture && !selectedPieceCaptures) {
                        // break
                    } else if (!canCapture) {
                        await fetchLegalMoves(foundPiece, board);
                    }
                }
            }
        }
    }, [isDragging, board, fetchLegalMoves, currentPlayer, fetchCanCapture]);

    const dropPiece = useCallback(async () => {
        if (activePiece && activePiecePosition && !isLoading) {
            const {x: newX, y: newY} = activePiecePosition;
            const {x: oldX, y: oldY} = activePiece.index;
            let isCapture = false;

            const isLegalMove = legalMoves.some(move => move.x === newX && move.y === newY);

            if (isLegalMove) {
                setBoard(prevBoard => {
                    const updatedBoard = [...prevBoard];
                    let movedPiece = {...activePiece.piece, x: newX, y: newY};

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

                    // Check for promotion to Dama
                    if (movedPiece.value === 'T' && newY === 0 && !movedPiece.isDama) {
                        movedPiece.isDama = true;
                        movedPiece.image = "/pieces/piece_true_dama.png"; // Update image to reflect promotion
                    } else if (movedPiece.value === 'F' && newY === 7 && !movedPiece.isDama) {
                        movedPiece.isDama = true;
                        movedPiece.image = "/pieces/piece_false_dama.png"; // Update image to reflect promotion
                    }

                    updatedBoard[newY][newX] = movedPiece;
                    updatedBoard[oldY][oldX] = null;

                    return updatedBoard;
                });

                // After making a move, fetch the legal moves for the moved piece again
                const updatedPiece = {...activePiece.piece, x: newX, y: newY};
                await fetchLegalMoves(updatedPiece, board);

                // Calculate scores if there is a capture
                if (isCapture) {
                    await fetchScores(activePiece.piece, operations[newX][newY]);
                    isCapture = false;
                }

                // Switch the currentPlayer
                setCurrentPlayer(currentPlayer === 'T' ? 'F' : 'T');
            } else {
                setBoard(prevBoard => {
                    const boardCopy = [...prevBoard];
                    boardCopy[oldY][oldX] = activePiece.piece;
                    return boardCopy;
                });
            }
        }

        setLegalMoves([]);
        setActivePiece(null);
        setActivePiecePosition(null);
        setIsDragging(false);  // Set isDragging back to false
    }, [activePiece, activePiecePosition, board, isLoading, legalMoves, fetchLegalMoves, fetchScores, score]);


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