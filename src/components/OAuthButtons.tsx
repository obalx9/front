import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface OAuthButtonsProps {
  className?: string;
  onSuccess?: (token: string, userId: string) => void;
}

const VK_CLIENT_ID = import.meta.env.VITE_VK_CLIENT_ID;
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

declare global {
  interface Window {
    VKIDSDK: any;
  }
}

export default function OAuthButtons({ className = '', onSuccess }: OAuthButtonsProps) {
  const [loadingYandex, setLoadingYandex] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vkSdkReady, setVkSdkReady] = useState(false);
  const vkContainerRef = useRef<HTMLDivElement>(null);
  const vkWidgetRef = useRef<any>(null);

  useEffect(() => {
    if (!VK_CLIENT_ID) return;

    const existingScript = document.querySelector('script[data-vkid-sdk]');
    if (existingScript) {
      if (window.VKIDSDK) {
        setVkSdkReady(true);
      } else {
        existingScript.addEventListener('load', () => setVkSdkReady(true));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js';
    script.setAttribute('data-vkid-sdk', 'true');
    script.onload = () => setVkSdkReady(true);
    script.onerror = () => setError('Не удалось загрузить VK SDK');
    document.head.appendChild(script);

    return () => {
      if (vkWidgetRef.current) {
        try { vkWidgetRef.current.destroy?.(); } catch {}
      }
    };
  }, []);

  useEffect(() => {
    if (!vkSdkReady || !vkContainerRef.current || !VK_CLIENT_ID) return;
    if (vkWidgetRef.current) return;

    try {
      const VKID = window.VKIDSDK;

      VKID.Config.init({
        app: parseInt(VK_CLIENT_ID),
        redirectUrl: `${APP_URL}/auth/vk/callback`,
        responseMode: VKID.ConfigResponseMode.Callback,
        source: VKID.ConfigSource.LOWCODE,
        scope: '',
      });

      const oAuth = new VKID.OAuthList();
      vkWidgetRef.current = oAuth;

      oAuth
        .render({
          container: vkContainerRef.current,
          oauthList: ['vkid'],
        })
        .on(VKID.WidgetEvents.ERROR, (err: any) => {
          setError('Ошибка авторизации через ВКонтакте');
        })
        .on(VKID.OAuthListInternalEvents.LOGIN_SUCCESS, async (payload: any) => {
          try {
            setError(null);
            const { code, device_id } = payload;

            const exchangeResult = await VKID.Auth.exchangeCode(code, device_id);

            const result = await api.post<{ user_id: string; token: string }>('/api/oauth/vk/exchange', {
              access_token: exchangeResult.access_token,
            });

            if (result.token) {
              api.setAuthToken(result.token);
            }

            if (onSuccess) {
              onSuccess(result.token, result.user_id);
            } else {
              window.location.href = `/role-select?user_id=${result.user_id}`;
            }
          } catch (err: any) {
            setError(err.message || 'Ошибка авторизации через ВКонтакте');
          }
        });
    } catch (err: any) {
      setError('Ошибка инициализации VK SDK');
    }
  }, [vkSdkReady, onSuccess]);

  const handleYandex = () => {
    setLoadingYandex(true);
    setError(null);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/api/oauth/yandex`;
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {VK_CLIENT_ID && (
          <div ref={vkContainerRef} className="vk-oauth-container" />
        )}

        <button
          type="button"
          onClick={handleYandex}
          disabled={loadingYandex}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#fc3f1d] hover:bg-[#e5381a] text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium text-sm"
        >
          {loadingYandex ? (
            <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
          ) : (
            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center font-bold text-base leading-none">Я</span>
          )}
          <span>Войти через Яндекс</span>
        </button>
      </div>
    </div>
  );
}
