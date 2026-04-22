"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const KEY = "cibo:install-dismissed";

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (standalone) return;
    if (localStorage.getItem(KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, Date.now().toString());
    } catch {}
  };

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    dismiss();
  };

  if (!show || !evt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[60] mx-auto max-w-md rounded-2xl glass p-3 shadow-2xl animate-[fadeIn_.2s_ease-out]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
          <Download size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Instalar Loja Cibo</p>
          <p className="text-xs text-text-muted">
            Acesso rápido no ecrã inicial, como uma app.
          </p>
        </div>
        <button
          onClick={install}
          className="rounded-full bg-brand px-3 py-2 text-xs font-semibold text-black"
        >
          Instalar
        </button>
        <button
          onClick={dismiss}
          aria-label="Fechar"
          className="rounded-full p-1 text-text-muted hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
