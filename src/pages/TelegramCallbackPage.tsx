import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function TelegramCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const telegramData = searchParams.get('telegram_data');

        if (!telegramData) {
          navigate('/login?error=No%20telegram%20data');
          return;
        }

        const data = JSON.parse(decodeURIComponent(telegramData));
        const result = await api.telegramAuth(data);

        if (result.token) {
          api.setAuthToken(result.token);
          await refreshUser();
          navigate('/');
        } else {
          navigate(`/login?error=${encodeURIComponent('No token received')}`);
        }
      } catch (error: any) {
        console.error('Telegram callback error:', error);
        navigate(`/login?error=${encodeURIComponent(error.message)}`);
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Обработка авторизации...</p>
      </div>
    </div>
  );
}
