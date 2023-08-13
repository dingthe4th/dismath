import React, { useState } from 'react'
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from '../firebase-config/config'
import Loading from "../components/loading";
import styles from '../styles/register.module.css';
import Link from "next/link";
import Image from "next/image";

const Register = () => {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const [user, loading] = useAuthState(firebaseAuth);

    const registerUser = async () => {
        try {
            setErrorMessage("")
            await createUserWithEmailAndPassword(firebaseAuth, email, password);
            router.push("/")
        } catch (e) {
            setErrorMessage(e?.message ?? 'Failed to register. Try again later.')
        }
    }

    if (loading) {
        return <Loading />;
    }

    if (user) {
        router.push("/")
        return <Loading />;
    }

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
                    <div className={styles.registerContainer}>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input type="text" value={email} onChange={(event) => setEmail(event.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Password</label>
                            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                        </div>
                        {errorMessage.length > 0 && <p className={styles.errorMessage}>{errorMessage}</p>}
                        <button className={styles.registerButton} onClick={registerUser}>REGISTER</button>
                    </div>
                </div>
            </div>
            <footer className={"footer"}>
                <p>&copy; Discrete Damath, All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Register