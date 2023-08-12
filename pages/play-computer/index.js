// play-computer.js
import React from 'react';
import { useRouter } from 'next/router';
import { app } from '../../firebase-config/config';
import { getDatabase, ref, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { initializeBoard } from "../../components/board";

const CreateSinglePlayerGame = () => {
    const router = useRouter();

    const createGame = () => {
        const db = getDatabase(app);
        const roomRef = ref(db, 'rooms');
        const newRoomRef = push(roomRef);
        const uniqueRoomId = newRoomRef.key;

        const firstMovePlayer = Math.random() < 0.5 ? 'T' : 'F';

        const initialData = {
            player1: { uid: getAuth(app).currentUser?.uid, piece: firstMovePlayer, email: getAuth(app).currentUser?.email },
            status: 'in progress',
            isPVP: false,
            board: initializeBoard(),
            firstTurn: firstMovePlayer,
            moves: [],
            currentPlayer: firstMovePlayer,
            // Other parameters if needed
        };

        set(newRoomRef, initialData)
            .then(() => {
                router.push(`/game/${uniqueRoomId}`);
            })
            .catch((error) => {
                // TODO: Handle any errors
            });
    };

    return (
        <div>
            <button onClick={createGame}>Start Single Player Game</button>
        </div>
    );
};

export default CreateSinglePlayerGame;
