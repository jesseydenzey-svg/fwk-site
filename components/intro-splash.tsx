"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "fwk-intro-splash-shown";

export default function IntroSplash() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY)) {
        return;
      }
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // sessionStorage blocked (private mode, etc.)
    }

    setVisible(true);

    const fadeTimer = setTimeout(() => setFading(true), 1400);
    const removeTimer = setTimeout(() => setVisible(false), 1900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`intro-splash ${fading ? "intro-splash--fading" : ""}`}
    >
      <div className="intro-splash__logo-ring">
        <Image
          src="/brand/logo.png"
          alt=""
          width={80}
          height={80}
          priority
          className="intro-splash__logo-img"
        />
      </div>

      <p className="intro-splash__brand">FRANCK WATAT CASE</p>

      <div className="intro-splash__dots">
        <span className="intro-splash__dot" />
        <span className="intro-splash__dot" />
        <span className="intro-splash__dot" />
      </div>
    </div>
  );
}
