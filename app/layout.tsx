import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { CartProvider } from "@/components/cart/cart-store";

export const metadata: Metadata = {
  title: { default: "Sequele Express — comida ao seu alcance", template: "%s · Sequele Express" },
  description:
    "Peça comida das melhores lojas de Angola. Pagamento na entrega ou por transferência — rápido, simples e seguro.",
  applicationName: "Sequele Express",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Sequele Express" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/pwa_icons_logo/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/pwa_icons_logo/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/pwa_icons_logo/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/pwa_icons_logo/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa_icons_logo/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/pwa_icons_logo/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/pwa_icons_logo/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/pwa_icons_logo/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO">
      <body className="min-h-dvh antialiased selection:bg-brand/30 selection:text-white">
        <CartProvider>{children}</CartProvider>
        <ServiceWorkerRegistrar />
        <InstallPrompt />
      </body>
    </html>
  );
}
