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



// Initialize the board
const initializeBoard = () => {
    const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if ((x + y) % 2 === 0) {
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
    const boardRef = useRef<HTMLDivElement>(null);

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

            // Set the legal moves here
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

                if (foundPiece) {
                    // Set states
                    setActivePiece({piece: foundPiece, index: {x, y}});
                    setIsDragging(true);  // Set isDragging to true

                    // Fetch legal moves
                    await fetchLegalMoves(foundPiece, board);
                }
            }
        }
    }, [isDragging, board, fetchLegalMoves]);

    const dropPiece = useCallback(async () => {
        if (activePiece && activePiecePosition) {
            const {x: newX, y: newY} = activePiecePosition;
            const {x: oldX, y: oldY} = activePiece.index;

            const isLegalMove = legalMoves.some(move => move.x === newX && move.y === newY);

            if (isLegalMove) {
                setBoard(prevBoard => {
                    const updatedBoard = [...prevBoard];
                    updatedBoard[newY][newX] = {...activePiece.piece, x: newX, y: newY}; // Update the piece's coordinates too
                    updatedBoard[oldY][oldX] = null;
                    return updatedBoard;
                });

                // After making a move, fetch the legal moves for the moved piece again
                const updatedPiece = {...activePiece.piece, x: newX, y: newY};
                await fetchLegalMoves(updatedPiece, board);
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
    }, [activePiece, activePiecePosition, board, legalMoves, fetchLegalMoves]);

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