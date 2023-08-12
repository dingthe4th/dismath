import React from 'react';
import Link from 'next/link';
import styles from '../styles/home.module.css';

const Home = () => {
    return (
        <div>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Link href="/">
            <span>
              <img src="/static/default_banner.jpg" alt="Dismath Checkers Logo" />
            </span>
                    </Link>
                </div>
                <nav className={styles.navigation}>
                    <ul>
                        <li>
                            <Link href="/" className={styles.link}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/how-to-play">How to Play</Link>
                        </li>
                        <li>
                            <Link href="/high-score">High Score</Link>
                        </li>
                        <li>
                            <Link href="/about">About</Link>
                        </li>
                    </ul>
                </nav>
            </header>

            <div className={styles.cover}>
                <div className={styles.overlay}>
                    <div className={styles.logoCenter}>
                        <Link href="/">
              <span>
                <img src="/static/default_logo.png" alt="Dismath Checkers Fancy Photo" />
              </span>
                        </Link>
                    </div>
                    <h1>Dismath Checkers</h1>
                    <div className={styles.buttons}>
                        <Link href="/play-human">
                            <button>Play vs Human</button>
                        </Link>
                        <Link href="/play-computer">
                            <button>Play vs Computer</button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ...rest of the content here... */}

            <footer className={styles.footer}>
                <p>&copy; Dismath Checkers, All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
