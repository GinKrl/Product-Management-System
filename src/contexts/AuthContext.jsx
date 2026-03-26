import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function handleSession(session) {
    if (!session) {
      setCurrentUser(null)
      setLoading(false)
      return
    }

    const { data: userData } = await supabase
      .from('user')
      .select('*')
      .eq('auth_id', session.user.id)
      .single()

    if (userData?.record_status === 'INACTIVE') {
      await supabase.auth.signOut()
      setCurrentUser(null)
    } else {
      setCurrentUser(userData)
    }
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}