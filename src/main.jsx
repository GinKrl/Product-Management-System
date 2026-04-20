import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { UserRightsProvider } from './contexts/UserRightsContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <UserRightsProvider>
        <App />
      </UserRightsProvider>
    </AuthProvider>
  </StrictMode>
)