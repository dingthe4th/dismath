import React from 'react';
import Link from 'next/link';
import styles from '../styles/home.module.css';

const Home = () => {
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
                    <div className={styles.logoCenter}>
                        <Link href="/">
                          <span>
                            <img src="/static/default_logo.png" alt="Discrete Damath Fancy Photo" />
                          </span>
                        </Link>
                    </div>
                    <div className={styles.buttons}>
                        <Link href="/play-human">
                            <button className={styles.gameButton}>Play vs Human</button>
                        </Link>
                        <Link href="/play-computer">
                            <button className={styles.gameButton}>Play vs Computer</button>
                        </Link>
                    </div>
                </div>
            </div>

            <footer className={"footer"}>
                <p>&copy; Discrete Damath, All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
