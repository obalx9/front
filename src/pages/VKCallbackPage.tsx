import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function VKCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('user_id');
    const code = params.get('code');
    const state = params.get('state');
    const deviceId = params.get('device_id');
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

    if (!code || !state) {
      navigate('/login?error=' + encodeURIComponent('Отсутствуют параметры авторизации'));
      return;
    }

    const storedVerifier = sessionStorage.getItem(`pkce_verifier_${state}`);
    const storedDeviceId = sessionStorage.getItem(`vk_device_id_${state}`);
    sessionStorage.removeItem(`pkce_verifier_${state}`);
    sessionStorage.removeItem(`vk_device_id_${state}`);

    if (!storedVerifier) {
      navigate('/login?error=' + encodeURIComponent('Сессия истекла, попробуйте снова'));
      return;
    }

    const exchangeCode = async () => {
      try {
        const result = await api.post<{ user_id: string; token: string }>('/api/oauth/vk/exchange', {
          code,
          code_verifier: storedVerifier,
          device_id: storedDeviceId || deviceId || '',
          state,
          redirect_uri: `${window.location.origin}/auth/vk/callback`,
        });

        if (result.token) {
          api.setAuthToken(result.token);
        }

        navigate(`/role-select?user_id=${result.user_id}`);
      } catch (err: any) {
        const message = err.message || 'Ошибка авторизации через ВКонтакте';
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
        <p className="text-gray-700 font-medium">Выполняется вход через ВКонтакте...</p>
      </div>
    </div>
  );
}
