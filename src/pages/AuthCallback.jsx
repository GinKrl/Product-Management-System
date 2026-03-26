import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: userData } = await supabase
          .from('user')
          .select('record_status')
          .eq('auth_id', session.user.id)
          .single()

        if (!userData || userData.record_status === 'INACTIVE') {
          await supabase.auth.signOut()
          navigate('/login?error=inactive')
        } else {
          navigate('/products')
        }
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Redirecting, please wait...</p>
    </div>
  )
}