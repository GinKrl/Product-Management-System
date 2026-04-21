import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { UserRightsProvider } from './contexts/UserRightsContext' // Add this

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <UserRightsProvider> {/* Wrap App here */}
        <App />
      </UserRightsProvider>
    </AuthProvider>
  </StrictMode>,
)
