import { useEffect } from "react";
import { useRouter } from "next/router"
import { signOut } from "firebase/auth"
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "../../firebase-config/config"

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
        router.push("/login")
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        router.push("/login")
        return <div>Please sign in!</div>;
    }

    const handleLogin = async () => {
        await signIn(firebaseAuth);
        const intendedUrl = sessionStorage.getItem("intendedUrl") || "/";
        router.push(intendedUrl);
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <button onClick={goToMainPage}>Go To Main Page</button>
            <button onClick={goToCreateGame}>Create Game</button>
            <button onClick={goToJoinGame}>Join Game</button>
            <button onClick={signOutUser}>Sign Out</button>
        </div>
    )
}

export default PVPGame