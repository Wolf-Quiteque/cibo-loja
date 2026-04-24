import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { CartProvider } from "@/components/cart/cart-store";

export const metadata: Metadata = {
  title: { default: "Sequele Expresse — comida ao seu alcance", template: "%s · Sequele Expresse" },
  description:
    "Peça comida das melhores lojas de Angola. Pagamento na entrega ou por transferência — rápido, simples e seguro.",
  applicationName: "Sequele Expresse",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Sequele Expresse" },
  formatDetection: { telephone: false },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
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
