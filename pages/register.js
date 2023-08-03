import { useState } from 'react'
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from '../firebase-config/config'

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
            router.push("/dashboard")
        } catch (e) {
            setErrorMessage(e?.message ?? 'Failed to register. Try again later.')
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        router.push("/dashboard")
        return <div>You're already signed in!</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ marginRight: "10px" }}>Email</label>
                <input
                    type="text"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label style={{ marginRight: "10px" }}>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>

            {errorMessage.length > 0 ? <p style={{ color: "red", fontWeight: "bold" }}>{errorMessage}</p> : <></>}

            <div>
                <button
                    onClick={registerUser}
                    style={{
                        fontSize: "21px",
                        padding: "10px",
                    }}
                >
                    REGISTER
                </button>
            </div>
        </div>
    )
}

export default Register