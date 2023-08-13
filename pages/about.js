import React from 'react';
import Link from 'next/link';
import styles from '../styles/about.module.css';
import Image from "next/image";

const About = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Link href="/">
                        <span>
                            <Image src="/static/default_logo.png" alt="Discrete Damath Logo" width={50} height={50} />
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
                <h1 id="discrete-damath">Discrete Damath</h1>
                <div>
                    <h3 id="inspiration">Inspiration</h3>
                    <p>Damath is a game which practices and tests the calculation skills of the players. Damath was invented by Jesus Huenda, a teacher from Sorsogon who aims to use board games to teach those dislike mathematics to learn the subject.
                        Back in senior high school, I made derivative damath, a version of Damath that practices players in basic derivative rules for calculus.</p>
                    <p>You can watch it here:</p>
                    <iframe
                        width="800"
                        height="450"
                        src="https://www.youtube.com/embed/8jMdBfAtsxM"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>

                    <p>Originally, I was planning to implement it, but it would be complex to calculate since it involves derivatives, so I went and implemented my former professor version of Damath for Discrete Mathematics, Dismath.</p>
                </div>

                <div>
                    <h3 id="about">About</h3>
                    <p> This is a web implementation of the paper:
                        <a href="https://ieeexplore.ieee.org/document/9072894"> https://ieeexplore.ieee.org/document/9072894 </a>
                         written by my former professor college professor Dr. Melvin Cabatuan.
                    </p>
                    <p>You can find more of his work at:</p>
                    <ul>
                        <li><a href="https://www.researchgate.net/profile/Melvin-Cabatuan">https://www.researchgate.net/profile/Melvin-Cabatuan</a></li>
                        <li><a href="https://github.com/melvincabatuan">https://github.com/melvincabatuan</a></li>
                        <li><a href="https://ieeexplore.ieee.org/author/38505771100">https://ieeexplore.ieee.org/author/38505771100</a></li>
                    </ul>

                    <p>His original game is written using pygame, and I implemented it using React.</p>
                    <p>There might be bugs in the code due to time constraints, but it should be stable at the very least.</p>
                    <p>The AI opponent is not as strong as stated in the paper, as my static evaluation function is the bare minimum. It does not search deep the tree of best case scenarios. Unfortunately, I cannot commit time to make it better due to the other ongoing bootcamp I am currently attending.</p>

                    <p> Tutorials followed to start this project: <a href="https://www.youtube.com/watch?v=Iri__zwxwHg&list=PLBmRxydnERkysOgOS917Ojc_-uisgb8Aj">Create a Chess Game with ReactJS</a></p>
                </div>
            </div>
            <footer className={styles.footer}>
                <p>&copy; Discrete Damath, All rights reserved.</p>
            </footer>
        </div>
    );
};

export default About;
