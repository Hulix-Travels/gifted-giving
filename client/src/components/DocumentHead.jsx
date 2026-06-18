import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '../config/api';

function setMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function DocumentHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const url = `${SITE_URL.replace(/\/$/, '')}${pathname === '/' ? '' : pathname}`;
    setMeta('og:url', url);
    setMeta('og:image', `${SITE_URL.replace(/\/$/, '')}/android-chrome-512x512.png`);
  }, [pathname]);

  return null;
}
