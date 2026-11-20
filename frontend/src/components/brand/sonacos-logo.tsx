import Link from "next/link";

type SonacosLogoProps = {
  compact?: boolean;
};

export function SonacosLogo({ compact = false }: SonacosLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white shadow-[0_6px_20px_rgba(24,57,38,0.06)]">
        <svg
          viewBox="0 0 64 64"
          className="h-9 w-9"
          aria-hidden="true"
          role="img"
        >
          <path
            d="M33 8c7 6 11 14 10 23-1 10-7 18-13 24 0-8 0-16 3-24 2-6 3-13 0-23z"
            fill="#0f8b4c"
          />
          <path
            d="M16 37c3-10 13-18 28-24 7 6 10 13 9 20-2 12-16 22-31 22-6 0-10-5-6-18z"
            fill="#e0262f"
          />
          <path
            d="M35 10c6 6 9 12 8 18-1 9-7 16-13 22 0-7 1-14 4-21 2-5 2-10 1-19z"
            fill="#ffffff"
          />
        </svg>
      </div>

      <div className={compact ? "hidden sm:block" : ""}>
        <p className="font-heading text-[1.9rem] font-black tracking-[-0.05em] text-brand-strong">
          SONACOS
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Semences et Engrais
        </p>
      </div>
    </Link>
  );
}
