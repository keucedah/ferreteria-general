/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Permite subir imágenes de hasta ~5 MB desde el panel de administración
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
