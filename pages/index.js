import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import useCounter from '../hooks/useCounter'

const Home = () => {
    const router = useRouter()
    const { count, increment, decrement } = useCounter()
    const [joke, setJoke] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const goToDashboard = () => {
        router.push("/dashboard")
    }

    /*
      /dashboard
      /dashboard/analytics
    */

    const goToJoseph420BlazeIt = () => {
        router.push("/joseph-420-blazeit")
    }

    const getJoke = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("https://icanhazdadjoke.com/", {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            })
            const data = await response.json()
            setJoke(data.joke)
        } catch {
            setJoke("Failed to fetch joke. Try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getJoke()
    }, [])

    return (
        <div>
            <div style={{ border: '1px solid black', padding: '20px', marginBottom: '10px' }}>
                <h2>Count {count}</h2>
                <button onClick={increment}>Increment</button>
                <button onClick={decrement}>Decrement</button>
            </div>

            <div style={{ border: '1px solid black', padding: '20px', marginBottom: '10px' }}>
                <h2>Joke of the Day</h2>
                <p>{isLoading ? "Loading..." : joke}</p>
                <button onClick={getJoke}>Get another joke</button>
            </div>

            <div style={{ border: '1px solid black', padding: '20px', marginBottom: '10px' }}>
                <button onClick={goToDashboard}>Go To Dashboard</button>
                <button onClick={goToJoseph420BlazeIt}>Go To Joseph 420 Blaze It</button>
            </div>
        </div>
    )
}

export default Home