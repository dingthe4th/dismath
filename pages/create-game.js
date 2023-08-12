// create-game.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { app } from '../firebase-config/config';
import { getDatabase, ref, push, set, onValue, off } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import {initializeBoard} from "../components/board";

const CreateGame = () => {
    const [roomId, setRoomId] = useState('');
    const router = useRouter();

    const createGame = () => {
        const db = getDatabase(app);
        const roomRef = ref(db, 'rooms');
        const newRoomRef = push(roomRef);
        const uniqueRoomId = newRoomRef.key;

        let firstMovePlayer = Math.random() < 0.5 ? 'T' : 'F';

        const initialData = {
            player1: { uid: getAuth(app).currentUser?.uid, piece: Math.random() < 0.5 ? 'T' : 'F', email: getAuth(app).currentUser?.email },
            status: 'waiting',
            isPVP: true,
            board: initializeBoard(),
            firstTurn: firstMovePlayer,
            moves: [],
            currentPlayer: firstMovePlayer,
            // Other parameters if needed
        };

        console.log("Player 1 created with uid: " + initialData.player1.uid, ' and piece is: ', initialData.player1.piece);
        console.log("First turn is: ", initialData.firstTurn);

        set(newRoomRef, initialData)
            .then(() => {
                setRoomId(uniqueRoomId);

                // Listen for changes in the room's status
                const statusRef = ref(db, `rooms/${uniqueRoomId}/status`);
                onValue(statusRef, (snapshot) => {
                    if (snapshot.val() === 'in progress') {
                        router.push(`/game/${uniqueRoomId}`);
                    }
                });
            })
            .catch((error) => {
                // Handle any errors
            });
    };

    // Clean up the listener when the component unmounts
    useEffect(() => {
        if (roomId) {
            const db = getDatabase(app);
            const statusRef = ref(db, `rooms/${roomId}/status`);
            const unsubscribe = onValue(statusRef, () => {});

            return () => {
                unsubscribe(); // Call the unsubscribe function to clean up the listener
            };
        }
    }, [roomId]);

    return (
        <div>
            <button onClick={createGame}>Create Game</button>
            {roomId && <p>Your Room ID: {roomId}</p>}
        </div>
    );
};

export default CreateGame;
