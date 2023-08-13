import React, { useEffect } from "react";
import { useRouter } from "next/router"
import { signOut } from "firebase/auth"
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "../firebase-config/config"
import styles from '../styles/playhuman.module.css';
import Link from "next/link";
import Loading from "../components/loading";
import Image from "next/image";

function PVPGame() {
    const router = useRouter()
    const [user, loading] = useAuthState(firebaseAuth);

    useEffect(() => {
        sessionStorage.setItem("intendedUrl", router.pathname);
    }, []);

    const goToMainPage = () => {
        router.push("/")
    }

    const goToCreateGame = () => {
        router.push("/create-game")
    }

    const goToJoinGame = () => {
        router.push("/join-game")
    }
    const signOutUser = async () => {
        await signOut(firebaseAuth)
        router.push("/")
    }

    useEffect(() => {
        if (!user) {
            router.push("/login")
        }
    }, [user, router]);

    if (loading) {
        return<Loading />;
    }

    const handleLogin = async () => {
        await signIn(firebaseAuth);
        const intendedUrl = sessionStorage.getItem("intendedUrl") || "/";
        router.push(intendedUrl);
    }

    return (
        <div className={"container"}>
            <header className={"header"}>
                <div className={"logo"}>
                    <Link href="/">
                        <span>
                            <Image src="/static/default_logo.png" alt="Discrete Damath Logo" width={30} height={30} />
                        </span>
                    </Link>
                </div>
                <nav className={"navigation"}>
                    <ul>
                        <li>
                            <Link href="/">Home</Link>
                        </li>
                        <li>
                            <Link href="/pages/how-to-play">How to Play</Link>
                        </li>
                        <li>
                            <Link href="/pages/about">About</Link>
                        </li>
                    </ul>
                </nav>
            </header>

            <div className={"cover"}>
                <div className={"overlay"}>
                    <div className={styles.buttonContainer}>
                        <button className={styles.gameButton} onClick={goToMainPage}>
                            <Image src="/static/main_page_icon.png" alt="Main Page" width={50} height={50} />
                            Go To Main Page
                        </button>
                        <button className={styles.gameButton} onClick={goToCreateGame}>
                            <Image src="/static/create_game_icon.png" alt="Create Game" width={50} height={50}/>
                            Create Game
                        </button>
                        <button className={styles.gameButton} onClick={goToJoinGame}>
                            <Image src="/static/join_game_icon.png" alt="Join Game" width={50} height={50}/>
                            Join Game
                        </button>
                        <button className={styles.gameButton} onClick={signOutUser}>
                            <Image src="/static/sign_out_icon.png" alt="Sign Out" width={50} height={50}/>
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
}

export default PVPGame