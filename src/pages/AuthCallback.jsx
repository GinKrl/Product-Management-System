import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("Session Error:", sessionError);
          navigate('/login', { replace: true });
          return;
        }

        const user = session.user;

        // 1. I-check kung existing na sa 'user' table
        const { data: userData, error: dbError } = await supabase
          .from('user')
          .select('record_status')
          .eq('userId', user.id)
          .single();

        // 2. Kung INACTIVE, i-kick out
        if (userData && userData.record_status === 'INACTIVE') {
          alert("Your account is currently INACTIVE.");
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
          return;
        }

        // 3. Kung BAGONG USER (wala sa DB), i-insert
        if (!userData) {
          const { error: insertError } = await supabase
            .from('user')
            .insert([{ 
              userId: user.id, 
              email: user.email, 
              full_name: user.user_metadata.full_name || 'User',
              record_status: 'ACTIVE' 
            }]);

          if (insertError) console.error("Insert Error:", insertError);
        }

        // 4. DONE! Takbo sa Dashboard
        navigate('/dashboard', { replace: true });

      } catch (err) {
        console.error("Auth Exception:", err);
        navigate('/login', { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Finalizing Login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;