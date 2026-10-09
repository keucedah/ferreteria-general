/* eslint-disable @next/next/no-img-element */

export default function ImagenProducto({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 ${className}`}>
        <svg viewBox="0 0 24 24" className="h-1/3 w-1/3" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}
