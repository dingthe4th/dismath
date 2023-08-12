// join-game.js
import React, { useState } from 'react';
import { app } from '../firebase-config/config';
import {getDatabase, ref, push, set, child, get, update} from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRouter } from "next/router";

const JoinGame = () => {
    const [inputRoomId, setInputRoomId] = useState('');
    const router = useRouter();

    const joinGame = () => {
        const db = getDatabase(app);
        const roomRef = ref(db, `rooms/${inputRoomId}`);

        get(roomRef).then((snapshot) => {
            if (snapshot.exists() && !snapshot.val().player2) {
                const player1Piece = snapshot.val().player1.piece;
                const player2Piece = player1Piece === 'T' ? 'F' : 'T';
                set(child(roomRef, 'player2'), { uid: getAuth(app).currentUser?.uid, piece: player2Piece, email: getAuth(app).currentUser?.email });
                set(child(roomRef, 'status'), 'in progress');
                console.log("Player 2 created with uid: " + getAuth(app).currentUser?.uid, ' and piece is: ', player2Piece);
                // Redirect to the game page with the room ID
                router.push(`/game/${inputRoomId}`);
            } else {
                // Handle error (e.g., room not found or already full)
                // TODO: Add a route to a page that shows room is full
            }
        });
    };

    return (
        <div>
            <input type="text" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value)} placeholder="Enter Room ID" />
            <button onClick={joinGame}>Join Game</button>
        </div>
    );
};

export default JoinGame;
