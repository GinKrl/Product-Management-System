import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          subscription.unsubscribe();

          const { data: userRow } = await supabase
            .from('user')
            .select('record_status')
            .eq('userId', session.user.id)
            .single();

          if (userRow?.record_status === 'INACTIVE') {
            alert('Your account is pending activation. Please wait for an Admin to activate it.');
            await supabase.auth.signOut();
            navigate('/login', { replace: true });
            return;
          }

          navigate('/dashboard', { replace: true });
        }

        if (event === 'INITIAL_SESSION' && !session) {
          subscription.unsubscribe();
          navigate('/login', { replace: true });
        }
      }
    );

    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      navigate('/login', { replace: true });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Finalizing Login...</p>
        <p className="text-gray-400 text-xs mt-1">Please wait...</p>
      </div>
    </div>
  );
};

export default AuthCallback;