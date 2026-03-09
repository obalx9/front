import { useEffect } from 'react';
import { api } from '../lib/api';

interface SiteScript {
  id: string;
  code: string;
  position: 'head' | 'body_end';
}

export function useSiteScripts() {
  useEffect(() => {
    let mounted = true;

    const inject = async () => {
      try {
        const data = await api.get<SiteScript[]>('/api/scripts', { skipAuth: true } as any);
        if (!mounted || !data) return;

        for (const script of data) {
          const existing = document.querySelector(`[data-site-script="${script.id}"]`);
          if (existing) continue;

          const container = document.createElement('div');
          container.setAttribute('data-site-script', script.id);
          container.innerHTML = script.code;

          const scripts = container.querySelectorAll('script');
          scripts.forEach(s => {
            const el = document.createElement('script');
            if (s.src) {
              el.src = s.src;
              el.async = true;
            } else {
              el.textContent = s.textContent;
            }
            Array.from(s.attributes).forEach(attr => {
              if (attr.name !== 'src') el.setAttribute(attr.name, attr.value);
            });
            s.replaceWith(el);
          });

          const target = script.position === 'head' ? document.head : document.body;
          target.appendChild(container);
        }
      } catch {
        // silently ignore
      }
    };

    inject();

    return () => {
      mounted = false;
    };
  }, []);
}
