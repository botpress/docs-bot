import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WebchatProvider } from '@botpress/webchat'
import App from './App'
import { CLIENT_ID } from '@/config/constants'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <WebchatProvider clientId={CLIENT_ID}>
      <App />
    </WebchatProvider>
  </StrictMode>,
)
