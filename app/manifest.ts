import type { MetadataRoute } from "next";

const ICON_DIR = "/pwa_icons_logo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sequele Express — comida ao seu alcance",
    short_name: "Sequele",
    description:
      "Peça comida das melhores lojas de Angola. Pagamento na entrega ou por transferência.",
    lang: "pt-AO",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07080b",
    theme_color: "#07080b",
    categories: ["food", "shopping", "lifestyle"],
    icons: [
      { src: `${ICON_DIR}/icon-72x72.png`, sizes: "72x72", type: "image/png", purpose: "any" },
      { src: `${ICON_DIR}/icon-96x96.png`, sizes: "96x96", type: "image/png", purpose: "any" },
      { src: `${ICON_DIR}/icon-128x128.png`, sizes: "128x128", type: "image/png", purpose: "any" },
      { src: `${ICON_DIR}/icon-144x144.png`, sizes: "144x144", type: "image/png", purpose: "any" },
      { src: `${ICON_DIR}/icon-152x152.png`, sizes: "152x152", type: "image/png", purpose: "any" },
      { src: `${ICON_DIR}/icon-192x192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${ICON_DIR}/icon-384x384.png`, sizes: "384x384", type: "image/png", purpose: "any" },
      { src: `${ICON_DIR}/icon-512x512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
