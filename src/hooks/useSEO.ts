import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const BASE_URL = 'https://go.keykurs.ru';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noIndex = false,
}: SEOProps) {
  const fullTitle = title.includes('КейКурс') ? title : `${title} — КейКурс`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        const attr = selector.includes('[name=') ? 'name' : 'property';
        const val = selector.match(/["']([^"']+)["']/)?.[1] ?? '';
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    if (description) {
      setMeta('meta[name="description"]', description);
      setMeta('meta[property="og:description"]', description);
      setMeta('meta[name="twitter:description"]', description);
    }

    if (keywords) setMeta('meta[name="keywords"]', keywords);

    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[name="twitter:image"]', ogImage);
    setMeta('meta[name="robots"]', noIndex ? 'noindex, nofollow' : 'index, follow');

    setLink('canonical', canonicalUrl);
  }, [fullTitle, description, keywords, canonicalUrl, ogImage, ogType, noIndex]);
}
