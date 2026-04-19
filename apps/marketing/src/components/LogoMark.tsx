interface LogoMarkProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 28, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="var(--brand)" />
      <rect x="8" y="16" width="32" height="22" rx="4" fill="white" fillOpacity="0.2" />
      <path
        d="M8 20 L24 30 L40 20 L40 16 Q40 12 36 12 L12 12 Q8 12 8 16 Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M8 34 L16 26 M40 34 L32 26"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}
