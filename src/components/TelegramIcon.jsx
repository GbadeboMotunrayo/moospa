// Telegram paper-plane mark. Single copy so every CTA on the site uses the
// same glyph — the old WhatsApp SVG was pasted inline in four places and had
// drifted out of sync between them.
export default function TelegramIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M21.94 4.3a1.2 1.2 0 0 0-1.24-.2L2.9 11.05a1.13 1.13 0 0 0 .06 2.12l4.03 1.4 1.6 5.06a1.06 1.06 0 0 0 1.74.44l2.3-2.14 4.1 3.02a1.16 1.16 0 0 0 1.83-.7l3.63-14.7a1.2 1.2 0 0 0-.25-1.25ZM9.6 14.28l-.53 3.63-1.2-3.8 8.7-5.68-6.97 5.85Z" />
    </svg>
  );
}
