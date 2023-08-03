import React, {useCallback, useEffect, useRef, useState} from 'react';
import board_style from '../styles/board.module.css';
import tile_style from '../styles/tile.module.css';
import Tile from './tile';

interface Piece {
    image: string;
    x: number;
    y: number;
    isPiece?: boolean;
}

const initializePieces = () => {
    const pieces: Piece[] = [];

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if ((x + y) % 2 === 0) {
                if (y < 3) {
                    pieces.push({ image: "/pieces/piece_false_normal.png", x, y });
                } else if (y > 4) {
                    pieces.push({ image: "/pieces/piece_true_normal.png", x, y });
                }
            }
        }
    }

    return pieces;
};

interface ActivePiece {
    piece: Piece;
    index: number;
}

const Board = () => {
    const [pieces, setPieces] = useState<Piece[]>(initializePieces());
    const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
    const [activePiecePosition, setActivePiecePosition] = useState<{ x: number; y: number } | null>(null);
    const boardRef = useRef<HTMLDivElement>(null);

    const grabPiece = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); // Prevent text selection while dragging
        const element = e.target as HTMLElement;
        const board = boardRef.current;
        if (element.classList.contains(tile_style.piece) && board) {
            const x = Math.floor((e.clientX - board.offsetLeft) / 100);
            const y = Math.floor((e.clientY - board.offsetTop) / 100);

            const foundIndex = pieces.findIndex((p) => p.x === x && p.y === y);
            const foundPiece = pieces[foundIndex];

            if (foundPiece) {
                setActivePiece({ piece: foundPiece, index: foundIndex });
                setActivePiecePosition({ x, y });
            }
        }
    }, [pieces]);

    const movePiece = useCallback(
        (e: MouseEvent) => {
            const board = boardRef.current;
            if (activePiece && board) {
                const minX = board.offsetLeft;
                const minY = board.offsetTop;
                const maxX = board.offsetLeft + board.clientWidth - 100;
                const maxY = board.offsetTop + board.clientHeight - 100;

                // Calculate the new position within the board bounds
                const x = Math.floor((e.clientX - board.offsetLeft) / 100);
                const y = Math.floor((e.clientY - board.offsetTop) / 100);

                // Bounds check to prevent dragging outside the board
                if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                    // Bounds check to prevent dragging beyond the visible board area
                    setActivePiecePosition({ x, y });
                }
            }
        },
        [activePiece]
    );



    const dropPiece = useCallback(() => {
        if (activePiece && activePiecePosition) {
            setPieces((prev) => prev.map((p, i) => (i === activePiece.index ? { ...p, ...activePiecePosition } : p)));
        }
        setActivePiece(null);
        setActivePiecePosition(null);
    }, [activePiece, activePiecePosition]);

    useEffect(() => {
        // Attach the event listeners when the component mounts
        document.addEventListener('mousemove', movePiece);
        document.addEventListener('mouseup', dropPiece);

        // Remove the event listeners when the component unmounts
        return () => {
            document.removeEventListener('mousemove', movePiece);
            document.removeEventListener('mouseup', dropPiece);
        };
    }, [movePiece, dropPiece]);

    // Render the board
    const board = [];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cellNum = x + y + 2;
            const currentPiece = pieces.find((p) => p.x === x && p.y === y);
            const isActivePiece = activePiece?.piece === currentPiece;

            const pieceX = isActivePiece && activePiecePosition ? activePiecePosition.x : x;
            const pieceY = isActivePiece && activePiecePosition ? activePiecePosition.y : y;

            board.push(
                <Tile
                    key={`${x},${y}`}
                    image={currentPiece?.image}
                    type={cellNum}
                    isPiece={Boolean(currentPiece)}
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
            {board}
        </div>
    );
};

export default Board;