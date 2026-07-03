"use client";

// Google Analytics (GA4) încărcat DOAR după consimțământ pentru „Statistici".
// Fără accept → scriptul nu se încarcă deloc. La revocare → GA se dezactivează.
import { useEffect, useState } from "react";
import { hasAnalyticsConsent, CONSENT_EVENT } from "@/lib/consent";

const GA_ID = "G-75E5MBPTYM";

export function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(hasAnalyticsConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!enabled) {
      w[`ga-disable-${GA_ID}`] = true; // respectă revocarea consimțământului
      return;
    }
    w[`ga-disable-${GA_ID}`] = false;
    if (document.getElementById("ga-gtag")) return; // deja încărcat

    const s = document.createElement("script");
    s.id = "ga-gtag";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    const inline = document.createElement("script");
    inline.id = "ga-inline";
    inline.innerHTML =
      `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}` +
      `gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`;
    document.head.appendChild(inline);
  }, [enabled]);

  return null;
}
