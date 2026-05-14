"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import "@/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#ea580c",
              secondary: "#fff",
            },
          },
        }}
      />
    </I18nextProvider>
  );
}
