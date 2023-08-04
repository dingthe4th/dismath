import { NextApiRequest, NextApiResponse } from 'next';

interface Piece {
    image: string;
    value: string;
    x: number;
    y: number;
    isPiece?: boolean;
    isDama?: boolean;
}

interface LegalMove {
    x: number; // x coordinate
    y: number; // y coordinate
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Given
            const { piece, board } = req.body;
            console.log('Received board state::: ', board);

            // Prepare the return
            const legalMoves: LegalMove[] = [];
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
                    if (board[newY][newX] === null) {
                        // If the square is empty, this is a legal move
                        legalMoves.push({ x: newX, y: newY });
                    } else if (board[newY][newX]?.value !== piece.value) {
                        // If the square is occupied by an opponent piece
                        // Check if the next square after capturing is within the board
                        let captureY = newY + dir.y;
                        let captureX = newX + dir.x;

                        if (captureX >= 0 && captureX < 8 && captureY >= 0 && captureY < 8 && board[captureY][captureX] === null) {
                            // If the next square after capturing is empty, this is a legal capture move
                            legalMoves.push({ x: captureX, y: captureY });
                        }
                    }
                }
            });

            // Calculate legal moves based on piece position x and y relative to the board
            res.status(200).json({ legalMoves });
        } catch (error) {
            console.error('Error calculating legal moves:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
