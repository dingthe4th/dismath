import { NextApiRequest, NextApiResponse } from 'next';
import {EMPTY_CELL, Piece} from '../../types/interface';
import { LegalMove } from '../../types/interface';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Given
            const { piece, board } = req.body;


            // Prepare the return
            const captureMoves: LegalMove[] = [];
            const nonCaptureMoves: LegalMove[] = [];
            // Variables for checking relative to position x,y of piece
            let direction: { x: number; y: number }[] = [];

            if (piece.isDama) {
                // For Dama, checks moves in all directions
                direction = [
                    { x: -1, y: -1 },
                    { x: 1, y: -1 },
                    { x: -1, y: 1 },
                    { x: 1, y: 1 },
                ];
            } else {
                // For regular pieces, checks moves in the forward direction only
                direction = piece.value === 'T' ? [{ x: -1, y: -1 }, { x: 1, y: -1 }] : [{ x: -1, y: 1 }, { x: 1, y: 1 }];
            }

            direction.forEach((dir) => {
                let newY = piece.y + dir.y;
                let newX = piece.x + dir.x;

                // Check if the next square in the same direction is within the board
                if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                    if (!board[newY][newX].isPiece) {
                        // If the square is empty, this is a non-capture move
                        nonCaptureMoves.push({ x: newX, y: newY });
                    } else if (board[newY][newX]?.value !== piece.value) {
                        // If the square is occupied by an opponent piece
                        // Check if the next square after capturing is within the board
                        let captureY = newY + dir.y;
                        let captureX = newX + dir.x;

                        if (captureX >= 0 && captureX < 8 && captureY >= 0 && captureY < 8 && !board[captureY][captureX].isPiece) {
                            // If the next square after capturing is empty, this is a capture move
                            captureMoves.push({ x: captureX, y: captureY });
                        }
                    }
                }
            });

            // If there are capture moves, return only the capture moves.
            // If there are no capture moves, return the non-capture moves.

            const legalMoves = captureMoves.length > 0 ? captureMoves : nonCaptureMoves;
            // Return legal moves based on piece position x and y relative to the board
            res.status(200).json({ legalMoves });
        } catch (error) {
            console.error('Error calculating legal moves:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
