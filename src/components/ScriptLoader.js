"use client";

import Script from "next/script";

export default function ScriptLoader() {
  return (
    <Script
      src="https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js"
      strategy="beforeInteractive"
      onLoad={() => {
        console.log("Uploadcare script loaded successfully");
      }}
      onError={(e) => {
        console.error("Failed to load Uploadcare script:", e);
      }}
    />
  );
}
