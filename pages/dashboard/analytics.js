import { useEffect } from "react";
import { useRouter } from "next/router"
import { signOut } from "firebase/auth"
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "../../firebase-config/config"

function Dashboard() {
    const router = useRouter()
    const [user, loading] = useAuthState(firebaseAuth);

    const goToMainPage = () => {
        router.push("/")
    }

    const signOutUser = async () => {
        await signOut(firebaseAuth)
        router.push("/login")
    }

    /*
    useEffect(() => {
      const getData = async () => {
        if (!user) return

        const userId = user?.uid
        if (!user?.uid) return

        const response = await fetch("asjdnaskjdn", { ... })
        const data = await response.json()
        // do something with the data
      }

      getData()
    }, [])
    */

    useEffect(() => {
        const getJoke = async () => {
            const response = await fetch("/api/joke", {
                method: "GET"
            })
            const data  = await response.json()
            console.log('data', data)
        }

        getJoke()
    }, [])


    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        router.push("/login")
        return <div>Please sign in!</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <button onClick={goToMainPage}>Go To Main Page</button>
            <button onClick={signOutUser}>Sign Out</button>
        </div>
    )
}

export default Dashboard