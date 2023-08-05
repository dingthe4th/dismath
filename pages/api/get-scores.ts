import { NextApiRequest, NextApiResponse } from 'next';

interface Piece {
    image: string;
    value: string;
    x: number;
    y: number;
    isPiece?: boolean;
    isDama?: boolean;
}

/*
*  Notes: Available operands = ["∨","↑","⊻","∧","↓","⇔","⇐","¬"]
* */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Given
            const { piece, operand, score } = req.body;
            // Initialize score to be updated
            let updatedScore : number = score;

            // Updating score logic
            if(piece.isDama) {
                if(piece.value === 'T') {
                    switch (operand) {
                        case '∨':
                        case '↑':
                        case '⊻':
                        case '⇐':
                        case '↓':
                        case '⇔':
                        case '¬':
                            updatedScore+=2;
                            break;
                        case '∧':
                            break;
                    }
                } else {
                    switch (operand) {
                        case '∧':
                        case '↑':
                        case '⊻':
                        case '⇐':
                        case '↓':
                        case '⇔':
                        case '¬':
                            updatedScore-=2;
                            break;
                        case '∨':
                            break;
                    }
                }
            } else {
                if(piece.value === 'T') {
                    switch (operand) {
                        case '∨':
                        case '↑':
                        case '⊻':
                        case '⇐':
                            updatedScore = updatedScore + 2;
                            break;
                        case '↓':
                        case '⇔':
                        case '¬':
                        case '∧':
                            break;
                    }
                } else {
                    switch (operand) {
                        case '↓':
                        case '⇔':
                        case '∧':
                        case '⇐':
                            console.log("I got here");
                            updatedScore = updatedScore - 2;
                            break;
                        case '∨':
                        case '↑':
                        case '⊻':
                        case '¬':
                            break;
                    }

                }
            }

            // Server checking
            // console.log('-------');
            // console.log('Old score: ' , score);
            // console.log('Operand: ', operand);
            // console.log('Piece: ', piece.value, ' isDama: ', piece.isDama);
            // console.log('Updated score: ' , updatedScore);
            // console.log('-------');
            res.status(200).json({ score: updatedScore });
        } catch (error) {
            console.error('Error calculating legal moves:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}

