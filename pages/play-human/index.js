import React, { useEffect } from "react";
import { useRouter } from "next/router"
import { signOut } from "firebase/auth"
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "../../firebase-config/config"
import styles from '../../styles/playhuman.module.css';
import Link from "next/link";
import Loading from "../../components/loading";

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

    if (!user) {
        router.push("/login")
    }

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
                            <img src="/static/default_logo.png" alt="Discrete Damath Logo" />
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
                    <div className={styles.buttonContainer}>
                        <button className={styles.gameButton} onClick={goToMainPage}>
                            <img src="/static/main_page_icon.png" alt="Main Page" />
                            Go To Main Page
                        </button>
                        <button className={styles.gameButton} onClick={goToCreateGame}>
                            <img src="/static/create_game_icon.png" alt="Create Game" />
                            Create Game
                        </button>
                        <button className={styles.gameButton} onClick={goToJoinGame}>
                            <img src="/static/join_game_icon.png" alt="Join Game" />
                            Join Game
                        </button>
                        <button className={styles.gameButton} onClick={signOutUser}>
                            <img src="/static/sign_out_icon.png" alt="Sign Out" />
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