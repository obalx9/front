import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function YandexCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('user_id');
    const code = params.get('code');
    const stateParam = params.get('state');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setTimeout(() => navigate('/login?error=' + encodeURIComponent(decodeURIComponent(errorParam))), 2000);
      return;
    }

    if (token && userId) {
      api.setAuthToken(token);
      navigate(`/role-select?user_id=${userId}`);
      return;
    }

    if (!code) {
      navigate('/login?error=' + encodeURIComponent('Отсутствует код авторизации'));
      return;
    }

    const exchangeCode = async () => {
      try {
        let redirectUri = `${window.location.origin}/auth/yandex/callback`;
        if (stateParam) {
          try {
            const decoded = atob(stateParam.replace(/-/g, '+').replace(/_/g, '/'));
            if (decoded.startsWith('http')) redirectUri = decoded;
          } catch {}
        }
        const result = await api.post<{ user_id: string; token: string }>('/api/oauth/yandex/exchange', {
          code,
          redirect_uri: redirectUri,
        });

        if (result.token) {
          api.setAuthToken(result.token);
        }

        navigate(`/role-select?user_id=${result.user_id}`);
      } catch (err: any) {
        const message = err.message || 'Ошибка авторизации через Яндекс';
        navigate('/login?error=' + encodeURIComponent(message));
      }
    };

    exchangeCode();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Перенаправление на страницу входа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Выполняется вход через Яндекс...</p>
      </div>
    </div>
  );
}
