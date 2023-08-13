import React, {useState} from 'react';
import {useRouter} from 'next/router';
import {app, firebaseAuth} from '../firebase-config/config';
import {getDatabase, push, ref, set} from 'firebase/database';
import {getAuth, signOut} from 'firebase/auth';
import {useAuthState} from "react-firebase-hooks/auth";
import Link from 'next/link';
import styles from '../styles/playai.module.css';
import {initializeBoard} from "../components/board";
import Loading from "../components/loading";
import Image from "next/image";

const CreateSinglePlayerGame = () => {
    const router = useRouter();
    const [user, loading] = useAuthState(firebaseAuth);
    const [errorMessage, setErrorMessage] = useState('');

    const createGame = () => {
        setErrorMessage(''); // Clear any previous errors
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
                setErrorMessage('Error in creating game');
            });
    };

    const signOutUser = async () => {
        await signOut(firebaseAuth);
        router.push("/login");
    };

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        router.push("/login");
    }

    return (
        <div className="container">
            <header className="header">
                <div className={"logo"}>
                    <Link href="/">
                        <span>
                            <Image src="/static/default_logo.png" alt="Discrete Damath Logo" width={30} height={30} />
                        </span>
                    </Link>
                </div>
                <nav className="navigation">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/pages/how-to-play">How to Play</Link></li>
                        <li><Link href="/pages/about">About</Link></li>
                    </ul>
                </nav>
            </header>
            <div className="cover">
                <div className="overlay">
                    {errorMessage && <div className="error">{errorMessage}</div>}
                    <div className={styles.buttonContainer}>
                        <button className={styles.gameButton} onClick={createGame}>
                            <Image src="/static/ai_icon.png" alt="AI Icon"  width={50} height={50}/>
                            Start Single Player Game
                        </button>
                        <button className={styles.gameButton} onClick={signOutUser}>
                            <Image src="/static/sign_out_icon.png" alt="Sign Out Icon" width={50} height={50} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
            <footer className="footer">
                <p>&copy; Discrete Damath, All rights reserved.</p>
            </footer>
        </div>
    );
};

export default CreateSinglePlayerGame;
