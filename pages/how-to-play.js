import React from 'react';
import Link from 'next/link';
import styles from '../styles/about.module.css';

const HowToPlay = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Link href="/">
                        <span>
                            <img src="/static/default_logo.png" alt="Discrete Damath Logo" />
                        </span>
                    </Link>
                </div>
                <nav className={styles.navigation}>
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
            <div className={styles.content}>
                <iframe
                    src="https://docs.google.com/presentation/d/1BBRXjgx873v1G8OfKJB6SSgGYQb8MWoduC3B8BfSBYw/embed?start=false&loop=false&delayms=3000"
                    frameBorder="0"
                    width="960"
                    height="569"
                    allowFullScreen
                ></iframe>
            </div>
            <footer className={styles.footer}>
                <p>&copy; Discrete Damath, All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HowToPlay;
