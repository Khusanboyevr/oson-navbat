export default function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" aria-hidden>
      <circle cx="120" cy="120" r="120" fill="url(#telegram-gradient)" />
      <path
        fill="#fff"
        d="M53 118.5 187 66c6.2-2.3 11.6 1.5 9.7 10.7l-.1.1-22.9 108c-1.7 7.7-6.2 9.6-12.6 6l-35-25.8-16.9 16.3c-1.9 1.9-3.5 3.5-7.1 3.5l2.5-35.9 65.5-59.2c2.8-2.5-.6-3.9-4.3-1.4l-81 51-34.9-10.9c-7.6-2.4-7.7-7.6 1.6-11.2z"
      />
      <defs>
        <linearGradient id="telegram-gradient" x1="120" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2AABEE" />
          <stop offset="1" stopColor="#229ED9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
