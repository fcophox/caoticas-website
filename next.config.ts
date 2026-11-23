import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las categorías y la búsqueda viven ahora en /catalogo como filtros. Los
  // enlaces viejos siguen funcionando: la consulta (?q=…) pasa tal cual.
  async redirects() {
    return [
      { source: "/categoria/:slug", destination: "/catalogo?categoria=:slug", permanent: true },
      { source: "/buscar", destination: "/catalogo", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
