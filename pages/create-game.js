// create-game.js
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {app, firebaseAuth} from '../firebase-config/config';
import {getDatabase, onValue, push, ref, set} from 'firebase/database';
import {getAuth} from 'firebase/auth';
import {initializeBoard} from "../components/board";
import Link from "next/link";
import styles from '../styles/creategame.module.css';
import {useAuthState} from "react-firebase-hooks/auth";
import Image from "next/image";

const CreateGame = () => {
    const router = useRouter();
    const [roomId, setRoomId] = useState('');
    const [user, loading] = useAuthState(firebaseAuth);

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
        };

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
        <div className={"container"}>
            <header className={"header"}>
                <div className={"logo"}>
                    <Link href="/">
                        <span>
                            <Image src="/static/default_logo.png" alt="Discrete Damath Logo" width={50} height={50} />
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
                    <button className={styles.createGameButton} onClick={createGame}>
                        Create Game
                    </button>
                    {roomId && (
                        <div className={styles.roomInfo}>
                            <p>Invite someone to play using this room ID:</p>
                            <h1>{roomId}</h1>
                        </div>
                    )}
                </div>
            </div>

            <footer className="footer">
                <p>&copy; Discrete Damath, All rights reserved.</p>
            </footer>
        </div>
    );
};

export default CreateGame;
