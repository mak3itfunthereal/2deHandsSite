import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/reference.css'
import './styles/homepage.css'
import './styles/animations.css'
import './styles/dark-mode.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
