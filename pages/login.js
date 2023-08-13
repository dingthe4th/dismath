import React, {useEffect, useState} from 'react'
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from '../firebase-config/config'
import styles from '../styles/login.module.css';
import Link from "next/link";
import Loading from "../components/loading";
import Image from "next/image";

const Login = () => {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [user, loading] = useAuthState(firebaseAuth);

    const loginUser = async () => {
        try {
            setErrorMessage("");
            await signInWithEmailAndPassword(firebaseAuth, email, password);

            // Retrieve the 'from' query parameter
            const { from } = router.query;

            // Redirect to the 'from' page if it's available, otherwise redirect to a default page
            if (from) {
                router.push(from);
            } else {
                router.push("/");
            }
        } catch (e) {
            setErrorMessage(e?.message ?? 'Failed to register. Try again later.');
        }
    };

    useEffect(() => {
        if (user) {
            const { from } = router.query;
            if (from) {
                router.push(from);
            } else {
                router.push("/");
            }
        }
    }, [user, router.query]);

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
                    <div className={styles.loginContainer}>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input type="text" value={email} onChange={(event) => setEmail(event.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Password</label>
                            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                        </div>
                        {errorMessage.length > 0 && <p className={styles.errorMessage}>{errorMessage}</p>}
                        <button className={styles.loginButton} onClick={loginUser}>
                            LOGIN
                        </button>
                        <div className={styles.registerLink}>
                            <p>No account yet? <Link href="/register">Register</Link></p>
                        </div>

                    </div>
                </div>
            </div>
            <footer className={"footer"}>
                <p>&copy; Discrete Damath, All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Login