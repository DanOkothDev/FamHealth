import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";
const APPLE_SCRIPT = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

const createScript = (src) => {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  return script;
};

export function useSocialAuth() {
  const [googleReady, setGoogleReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const googleResolveRef = useRef(null);
  const googleRejectRef = useRef(null);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    const script = createScript(GOOGLE_SCRIPT);
    script.onload = () => {
      if (window.google?.accounts?.id) initGoogle();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (window.AppleID?.auth) {
      initApple();
      return;
    }

    const script = createScript(APPLE_SCRIPT);
    script.onload = () => {
      if (window.AppleID?.auth) initApple();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initGoogle = () => {
    if (!window.google?.accounts?.id) return;
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse,
      ux_mode: "popup",
    });

    setGoogleReady(true);
  };

  const handleGoogleCredentialResponse = (response) => {
    if (response?.credential) {
      googleResolveRef.current?.(response);
      googleResolveRef.current = null;
      googleRejectRef.current = null;
      return;
    }

    googleRejectRef.current?.("Google sign-in failed");
    googleResolveRef.current = null;
    googleRejectRef.current = null;
  };

  const signInWithGoogle = () =>
    new Promise((resolve, reject) => {
      if (!googleReady || !window.google?.accounts?.id) {
        reject("Google SDK not loaded");
        return;
      }

      googleResolveRef.current = resolve;
      googleRejectRef.current = reject;

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          reject("Google sign-in was cancelled or blocked");
          googleResolveRef.current = null;
          googleRejectRef.current = null;
        }
      });
    });

  const initApple = () => {
    if (!window.AppleID?.auth) return;
    const clientId = process.env.REACT_APP_APPLE_CLIENT_ID;
    const redirectURI = process.env.REACT_APP_APPLE_REDIRECT_URI;
    if (!clientId || !redirectURI) return;

    window.AppleID.auth.init({
      clientId,
      scope: "name email",
      redirectURI,
      usePopup: true,
    });

    setAppleReady(true);
  };

  const signInWithApple = () => {
    if (!appleReady || !window.AppleID?.auth) {
      return Promise.reject("Apple SDK not loaded");
    }
    return window.AppleID.auth.signIn();
  };

  return { googleReady, appleReady, signInWithGoogle, signInWithApple };
}
