"use client";

import { useEffect, useState } from "react";
import { X, Download, Share, PlusSquare, Check, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const KEY = "cibo:install-dismissed";

type Mode = "native" | "ios";

interface NavStandalone extends Navigator {
  standalone?: boolean;
}

function isIOSDevice(ua: string): boolean {
  return /iPhone|iPad|iPod/.test(ua);
}

function isIOSSafari(ua: string): boolean {
  if (!isIOSDevice(ua)) return false;
  // exclude in-app browsers that can't install PWAs
  return !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|FBAN|FBAV|Instagram|Line\//.test(ua);
}

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const nav = navigator as NavStandalone;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    if (standalone) return;
    if (localStorage.getItem(KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setMode("native");
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    if (isIOSSafari(navigator.userAgent)) {
      setMode("ios");
      const t = setTimeout(() => setShowBanner(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setShowBanner(false);
    setShowGuide(false);
    try {
      localStorage.setItem(KEY, Date.now().toString());
    } catch {}
  };

  const actOnBanner = async () => {
    if (mode === "ios") {
      setShowGuide(true);
      return;
    }
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    dismiss();
  };

  if (!showBanner && !showGuide) return null;
  if (!mode) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-24 left-4 right-4 z-[60] mx-auto max-w-md rounded-2xl glass p-3 shadow-2xl animate-[fadeIn_.2s_ease-out]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Download size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Instalar Sequele Express</p>
              <p className="text-xs text-text-muted">
                {mode === "ios"
                  ? "Adicione ao ecrã principal em 3 passos."
                  : "Acesso rápido no ecrã inicial, como uma app."}
              </p>
            </div>
            <button
              onClick={actOnBanner}
              className="rounded-full bg-brand px-3 py-2 text-xs font-semibold text-black"
            >
              {mode === "ios" ? "Ver como" : "Instalar"}
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
      )}

      {showGuide && mode === "ios" && (
        <IOSInstallGuide onClose={dismiss} />
      )}
    </>
  );
}

function IOSInstallGuide({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm animate-[fadeIn_.2s_ease-out] sm:items-center">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border-t border-border bg-surface shadow-2xl sm:rounded-3xl sm:border"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(0,230,168,0.22),transparent_70%)]"
        />

        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
        >
          <X size={16} />
        </button>

        <div className="relative z-10 px-6 pt-8 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <Sparkles size={14} /> Para iPhone e iPad
          </div>
          <h2 className="mt-2 text-2xl font-black leading-tight">
            Instale em <span className="text-brand">3 passos</span>
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Tenha a Sequele Express no ecrã principal, como uma aplicação nativa — sem Play Store.
          </p>
        </div>

        <ol className="relative z-10 flex flex-col gap-3 px-6 pb-6">
          <Step
            n={1}
            title="Abra o menu Partilhar"
            description="Toque no ícone Partilhar na barra inferior do Safari."
            icon={<Share size={22} />}
          />
          <Step
            n={2}
            title="Adicionar ao Ecrã Principal"
            description={`Deslize e escolha "Adicionar ao Ecrã Principal".`}
            icon={<PlusSquare size={22} />}
          />
          <Step
            n={3}
            title="Toque em Adicionar"
            description="Confirme no canto superior direito. O ícone aparece no seu ecrã."
            icon={<Check size={22} />}
          />
        </ol>

        <div className="relative z-10 border-t border-border bg-surface-2/60 px-6 py-4 text-center safe-bottom">
          <p className="text-[11px] text-text-muted">
            Disponível apenas no Safari. Em Chrome, Firefox ou apps como Instagram, abra primeiro no Safari.
          </p>
          <button
            onClick={onClose}
            className="mt-3 w-full rounded-full bg-brand py-3 text-sm font-bold text-black"
          >
            Percebi
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  description,
  icon,
}: {
  n: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-border bg-surface-2/60 p-3 transition hover:border-brand/40">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/25">
        {icon}
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-black text-black ring-2 ring-surface">
          {n}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </div>
  );
}
