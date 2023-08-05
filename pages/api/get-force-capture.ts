import {NextApiRequest, NextApiResponse} from 'next';
import {Piece} from '../../types/interface';

interface LegalMove {
    x: number; // x coordinate
    y: number; // y coordinate
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Given
            const { selectedPiece, board, currentPlayer } = req.body;

            let canCapture = false;
            let selectedPieceCaptures = false;

            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board[y][x];
                    if (piece !== null && piece.value === currentPlayer) {
                        // Calculate legal moves for this piece
                        const legalMoves = await fetchLegalMoves(piece, board);
                        if (legalMoves.some(move => isCaptureMove(move, piece, board))) {
                            if(selectedPiece.x === piece.x && selectedPiece.y === piece.y) {
                                selectedPieceCaptures = true;
                            }
                            canCapture = true;
                            // break; // This is commented out because we want to check for all legal moves
                            // if the selectedPiece can capture or not
                        }
                    }
                }
            }

            res.status(200).json({ canCapture, selectedPieceCaptures });
        } catch (error) {
            console.error('Error calculating if player can capture:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}


// Function to calculate legal moves for a piece
async function fetchLegalMoves(piece: Piece, board: (Piece | null)[][]): Promise<Array<{x: number, y: number}>> {
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
            if (board[newY][newX] === null) {
                // If the square is empty, this is a non-capture move
                nonCaptureMoves.push({ x: newX, y: newY });
            } else if (board[newY][newX]?.value !== piece.value) {
                // If the square is occupied by an opponent piece
                // Check if the next square after capturing is within the board
                let captureY = newY + dir.y;
                let captureX = newX + dir.x;

                if (captureX >= 0 && captureX < 8 && captureY >= 0 && captureY < 8 && board[captureY][captureX] === null) {
                    // If the next square after capturing is empty, this is a capture move
                    captureMoves.push({ x: captureX, y: captureY });
                }
            }
        }
    });

    // If there are capture moves, return only the capture moves.
    // If there are no capture moves, return the non-capture moves.
    return captureMoves.length > 0 ? captureMoves : nonCaptureMoves;
}

// Function to determine if a move is a capture move
function isCaptureMove(move: {x: number, y: number}, piece: Piece, board: (Piece | null)[][]): boolean {
    // If the absolute difference in x or y coordinates is 2, the move is a capture move
    return Math.abs(move.x - piece.x) === 2 && Math.abs(move.y - piece.y) === 2;
}
