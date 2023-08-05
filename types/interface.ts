import React from "react";

export interface Piece {
    image: string;
    value: string;
    x: number;
    y: number;
    isPiece?: boolean;
    isDama?: boolean;
}

export interface ActivePiece {
    piece: Piece;
    index: { x: number, y: number };
}

export interface LegalMove {
    x: number; // x coordinate
    y: number; // y coordinate
}

export interface PreviousMove {
    type?: string;
    capture?: boolean;
}

export interface ScoreboardProps {
    score: number;
}

export interface TileProps {
    image?: string;
    x: number;
    y: number;
    type: number;
    isLegalMove?: boolean
    isPiece?: boolean;
    operand: string;
}

export interface Move {
    x: number;
    y: number;
}

export interface ScoreNotation {
    moveNumber: number;
    source?: LegalMove;
    dest?: LegalMove;
    calculation: string;
    score: number;
    total: number;
}

interface ComputerMove {
    source?: LegalMove;
    dest?: LegalMove;
}

export interface LegalComputerMove {
    source: { x: number; y: number };
    dest: { x: number; y: number };
}