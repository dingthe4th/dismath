import React from 'react';
import Link from 'next/link';
import styles from '../styles/about.module.css';
import Image from "next/image";

const HowToPlay = () => {
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
                        <iframe
                            src="https://docs.google.com/presentation/d/1BBRXjgx873v1G8OfKJB6SSgGYQb8MWoduC3B8BfSBYw/embed?start=false&loop=false&delayms=3000"
                            frameBorder="0"
                            width="1000"
                            height="600"
                            allowFullScreen
                        ></iframe>
                </div>
            </div>

            <footer className={"footer"}>
                <p>&copy; Discrete Damath, All rights reserved.</p>
            </footer>
        </div>

    );
};

export default HowToPlay;
