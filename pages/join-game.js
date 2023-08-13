// join-game.js
import React, { useState } from 'react';
import { app } from '../firebase-config/config';
import {getDatabase, ref, push, set, child, get, update} from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRouter } from "next/router";
import Link from "next/link";
import styles from '../styles/joingame.module.css';
import Image from "next/image";

const JoinGame = () => {
    const [inputRoomId, setInputRoomId] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const joinGame = () => {
        const db = getDatabase(app);
        const roomRef = ref(db, `rooms/${inputRoomId}`);

        get(roomRef).then((snapshot) => {
            if (snapshot.exists() && !snapshot.val().player2) {
                try {
                    const player1Piece = snapshot.val().player1?.piece;
                    const player2Piece = player1Piece === 'T' ? 'F' : 'T';
                    set(child(roomRef, 'player2'), { uid: getAuth(app).currentUser?.uid, piece: player2Piece, email: getAuth(app).currentUser?.email });
                    set(child(roomRef, 'status'), 'in progress');
                    console.log("Player 2 created with uid: " + getAuth(app).currentUser?.uid, ' and piece is: ', player2Piece);
                    // Redirect to the game page with the room ID
                    router.push(`/game/${inputRoomId}`);
                } catch (error) {
                    setError("ROOM NOT FOUND");
                }
            } else {
                setError("ROOM NOT FOUND");
            }
        });
    };

    return (
        <div className={"container"}>
            <header className={"header"}>
                <div className={"logo"}>
                    <Link href="/">
                        <span>
                            <Image src="/static/default_logo.png" alt="Discrete Damath Logo" width={20} height={20}/>
                        </span>
                    </Link>
                </div>
                <nav className={"navigation"}>
                    <ul>
                        <li>
                            <Link href="/">Home</Link>
                        </li>
                        <li>
                            <Link href="/how-to-play">How to Play</Link>
                        </li>
                        <li>
                            <Link href="/about">About</Link>
                        </li>
                    </ul>
                </nav>
            </header>
            <div className={"cover"}>
                <div className={"overlay"}>
                    <div className={styles.inputContainer}>
                        <input
                            className={styles.roomInput}
                            type="text"
                            value={inputRoomId}
                            onChange={(e) => setInputRoomId(e.target.value)}
                            placeholder="Enter Room ID"
                        />
                        <button className={styles.joinButton} onClick={joinGame}>
                            Join Game
                        </button>

                        {error && <div className={styles.errorMessage}>{error}</div>}
                    </div>
                </div>
            </div>
            <footer className={"footer"}>
                <p>&copy; Discrete Damath, All rights reserved.</p>
            </footer>
        </div>
    );
};

export default JoinGame;
