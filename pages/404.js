import styles from '../styles/error.module.css';
import Link from "next/link";

const CustomErrorPage = () => {
    return (
        <div className={"container"}>
            <header className={"header"}>
                <div className={"logo"}>
                    <Link href="/">
            <span>
              <img src="/static/default_banner.jpg" alt="Dismath Checkers Logo" />
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
                    <h1>404 - Page Does Not Exist Foo.</h1>
                </div>
            </div>
            <footer className={"footer"}>
                <p>&copy; Dismath Checkers, All rights reserved.</p>
            </footer>
        </div>
    )
}

export default CustomErrorPage
