import Image from "next/image";

export default function Loading() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-bg px-6"
      role="status"
      aria-live="polite"
      aria-label="A carregar Sequele Express"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative grid h-32 w-32 place-items-center">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full border-4 border-brand/15 border-t-brand border-r-brand animate-spin motion-reduce:animate-none"
          />
          <div
            aria-hidden
            className="absolute inset-2 rounded-full border border-brand/15"
          />
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-surface shadow-[0_12px_30px_-12px_rgba(194,65,12,0.45)]">
            <Image
              src="/pwa_icons_logo/icon-192x192.png"
              alt=""
              fill
              priority
              sizes="96px"
              className="object-cover"
            />
          </div>
        </div>
        <p className="mt-5 text-base font-bold text-text">Sequele Express</p>
        <p className="mt-1 text-sm text-text-muted">A preparar tudo para si…</p>
      </div>
    </main>
  );
}
