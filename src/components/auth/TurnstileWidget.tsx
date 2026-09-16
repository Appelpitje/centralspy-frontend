import React, { useEffect, useRef } from 'react';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'light' | 'dark' | 'auto';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function getTurnstileSiteKey(): string {
  return import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || '';
}

export const TurnstileWidget: React.FC<{
  onToken: (token: string) => void;
  resetKey?: number;
}> = ({ onToken, resetKey = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const sitekey = getTurnstileSiteKey();

  useEffect(() => {
    if (!sitekey || !containerRef.current) {
      return;
    }

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) {
        return;
      }
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        theme: 'light',
        callback: (token: string) => onTokenRef.current(token),
        'expired-callback': () => onTokenRef.current(''),
        'error-callback': () => onTokenRef.current(''),
      });
    };

    let script: HTMLScriptElement | null = null;
    if (window.turnstile) {
      renderWidget();
    } else {
      script = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile"]'
      );
      if (!script) {
        script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderWidget);
    }

    return () => {
      script?.removeEventListener('load', renderWidget);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [sitekey, resetKey]);

  if (!sitekey) {
    return null;
  }

  return <div ref={containerRef} data-testid="cf-turnstile" className="flex justify-center" />;
};
