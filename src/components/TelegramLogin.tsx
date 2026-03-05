import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';

interface TelegramLoginProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      Login?: {
        redirectUrl?: string;
      };
    };
  }
}

export default function TelegramLogin({ onSuccess }: TelegramLoginProps) {
  const { t } = useLanguage();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string>('');

  useEffect(() => {
    const loadBotConfig = async () => {
      try {
        const data = await api.get<{ bot_username: string }>('/api/telegram/main-bot-username', { skipAuth: true });
        if (data?.bot_username) {
          setBotUsername(data.bot_username);
        }
      } catch (err) {
        console.error('Error loading bot config:', err);
      }
    };

    loadBotConfig();
  }, []);

  const handleTelegramLogin = async () => {
    if (!botUsername) return;

    setLoading(true);
    setError(null);

    try {
      const callbackUrl = `${window.location.origin}/telegram-callback`;
      const url = `https://t.me/${botUsername}?start=auth_${encodeURIComponent(callbackUrl)}`;
      window.location.href = url;
    } catch (err: any) {
      console.error('Telegram login error:', err);
      setError(err.message || t('authError'));
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleTelegramLogin}
        disabled={loading || !botUsername}
        className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {t('authenticating')}
          </>
        ) : (
          <>
            <Send size={18} />
            {t('loginWithTelegram')}
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
