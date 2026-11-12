import { useEffect, useState } from 'react'
import { api } from './api'

type ConnectionState = 'loading' | 'connected' | 'error'

export default function App() {
  const [connection, setConnection] = useState<ConnectionState>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setConnection('loading')

    api.getInfo({ signal: controller.signal }).then(
      () => {
        if (!controller.signal.aborted) {
          setConnection('connected')
        }
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Could not connect to the API:', error)
          setConnection('error')
        }
      },
    )

    return () => controller.abort()
  }, [attempt])

  return (
    <main>
      <h1>2deHandsSite</h1>
      <p role="status">
        {connection === 'loading' && 'Connecting to the API...'}
        {connection === 'connected' && 'Connected to the API.'}
        {connection === 'error' && 'Could not connect to the API.'}
      </p>
      {connection === 'error' && (
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Retry
        </button>
      )}
    </main>
  )
}
