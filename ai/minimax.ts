import {Piece, LegalMove, LegalComputerMove} from '../types/interface';

export function staticEvaluation(player_side: 'T' | 'F', board: (Piece | null)[][]): number {
    let score = 0;

    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            const piece = board[y][x];
            if (piece) {
                const pieceValue = piece.isDama ? 5 : 1;

                // Add a bonus for pieces that are closer to becoming Dama
                const promotionBonus = piece.value === player_side ? (7 - y) * 0.75 : y * 0.75;

                // Combine piece value and bonus
                const totalValue = pieceValue + promotionBonus;

                if (piece.value === player_side) {
                    score += totalValue;
                } else {
                    score -= totalValue;
                }
            }
        }
    }
    // TODO: If time permits, add more sophisticated evaluation
    // since the A.I. is still not perfect, or simply still beatable

    return score;
}


interface ComputerMove {
    source: LegalMove; // or { x: number; y: number }
    dest: LegalMove;   // or { x: number; y: number }
}

export function getAllPossibleMoves(player_side: string, board: (Piece | null)[][]) {
    // Prepare the return values
    const captureMoves: LegalComputerMove[] = [];
    const nonCaptureMoves: LegalComputerMove[] = [];

    // Iterate through the board to find all pieces of the current player
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const piece = board[y][x];
            if (piece && piece.value === player_side) {
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
                    direction = player_side === 'T' ? [{ x: -1, y: -1 }, { x: 1, y: -1 }] : [{ x: -1, y: 1 }, { x: 1, y: 1 }];
                }

                direction.forEach((dir) => {
                    let newY = y + dir.y;
                    let newX = x + dir.x;

                    // Check if the next square in the same direction is within the board
                    if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                        if (board[newY][newX] === null) {
                            // If the square is empty, this is a non-capture move
                            nonCaptureMoves.push({ source: { x, y }, dest: { x: newX, y: newY } });
                        } else if (board[newY][newX]?.value !== piece.value) {
                            // If the square is occupied by an opponent piece
                            // Check if the next square after capturing is within the board
                            let captureY = newY + dir.y;
                            let captureX = newX + dir.x;

                            if (captureX >= 0 && captureX < 8 && captureY >= 0 && captureY < 8 && board[captureY][captureX] === null) {
                                // If the next square after capturing is empty, this is a capture move
                                captureMoves.push({ source: { x, y }, dest: { x: captureX, y: captureY } });
                            }
                        }
                    }
                });
            }
        }
    }

    // If there are capture moves, return only the capture moves.
    // If there are no capture moves, return the non-capture moves.
    return captureMoves.length > 0 ? captureMoves : nonCaptureMoves;
}

export function oppositePlayer(player_side: string): 'T' | 'F' {
    return player_side === 'T' ? 'F' : 'T';
}

export function MMAB(depth: number, player_side: 'T' | 'F', alpha: number, beta: number, board: (Piece | null)[][]): number {
    if (depth === 0) {
        return staticEvaluation(player_side, board); // Define static_evaluation function as needed
    }

    const nodes = getAllPossibleMoves(player_side, board);

    if (player_side === 'F') { // Minimizing Player
        for (const child of nodes) {
            let newBeta;
            if (depth === 1) {
                newBeta = Math.min(beta, MMAB(depth - 1, player_side, alpha, beta, board));
            } else {
                newBeta = Math.min(beta, MMAB(depth - 1, oppositePlayer(player_side), alpha, beta, board));
            }

            if (alpha >= newBeta) {
                break;
            }
            beta = newBeta;
        }
        return beta;
    } else { // 'T': Maximizing Player
        for (const child of nodes) {
            let newAlpha;
            if (depth === 1) {
                newAlpha = Math.max(alpha, MMAB(depth - 1, player_side, alpha, beta, board));
            } else {
                newAlpha = Math.max(alpha, MMAB(depth - 1, oppositePlayer(player_side), alpha, beta, board));
            }

            if (newAlpha >= beta) {
                break;
            }
            alpha = newAlpha;
        }
        return alpha;
    }
}

export function applyMove(board: (Piece | null)[][], move: ComputerMove, piece: Piece): (Piece | null)[][] {
    const { source, dest } = move;
    const newBoard = [...board.map(row => [...row])]; // Clone the board

    // Move the piece to the destination
    newBoard[dest.y][dest.x] = piece;

    // Clear the source square
    newBoard[source.y][source.x] = null;

    return newBoard;
}

export function computerMove(board: (Piece | null)[][], player_side: string): ComputerMove | null {
    // Determine the best move using the Minimax algorithm with Alpha-Beta pruning
    let bestScore = -Infinity;
    let bestMove: ComputerMove | null = null;

    const nodes = getAllPossibleMoves(player_side, board);

    nodes.forEach((move) => {
        // Get the piece at the source position
        const piece = board[move.source.y][move.source.x];

        // Apply the move to create a new board state
        if (piece) {
            const tempPiece: Piece = { ...piece, x: move.dest.x, y: move.dest.y };
            const newBoard = applyMove(board, move, tempPiece);

            // Call the Minimax function for the new state
            const score = MMAB(3, oppositePlayer(player_side), -Infinity, Infinity, newBoard);

            // Update the best score and move if this move is better
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    });

    return bestMove;
}


