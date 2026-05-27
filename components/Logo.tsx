"use client";
import type { CSSProperties } from "react";

/**
 * The RoastMySite flame mark.
 *
 * Strong silhouette at 16x16 (favicon size). Brand gradient bottom-to-top:
 * deep red → orange → amber tip. Optional inner highlight ring for depth.
 */
export function LogoMark({
  size = 32,
  className,
  style,
  withGlow = false,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  withGlow?: boolean;
}) {
  const id = "rms";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="RoastMySite logo"
    >
      <defs>
        <linearGradient id={`${id}-outer`} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#7F1D1D" />
          <stop offset="25%" stopColor="#DC2626" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="92%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="60%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FFFBEB" />
        </linearGradient>
        {withGlow && (
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      {/* Outer flame — asymmetric, tapered tip */}
      <path
        d="M16 1.5
           C 16 5.5 14.3 7.8 12.4 10.4
           C 10.4 13.2 8.6 16.2 8.6 20
           C 8.6 21.8 9.3 23.2 10.4 23.2
           C 9.6 21.6 10.3 19.2 12 17.8
           C 11.9 20.4 13.5 22.3 14.8 22.3
           C 15.9 19.7 17 17.4 18.8 15
           C 19 17.5 20.2 19.2 21.5 19.2
           C 22.5 19.7 23.4 20.8 23.4 22.2
           C 24.2 23 24.8 24.4 24.8 26
           C 24.8 28.8 21.1 30.6 16 30.6
           C 10.9 30.6 7.2 28 7.2 24
           C 7.2 18 11.8 14.5 13.6 9.6
           C 14.7 6.7 16 5 16 1.5 Z"
        fill={`url(#${id}-outer)`}
        filter={withGlow ? `url(#${id}-glow)` : undefined}
      />
      {/* Inner flame — lighter wisp for depth */}
      <path
        d="M16 13.5
           C 15 16 13.5 17.5 13 19.5
           C 12.6 21.2 13.2 22.4 14.4 22.4
           C 13.8 21.4 14.4 20 15.5 19.2
           C 15.7 20.6 16.4 21.5 17 21.5
           C 17.6 20.5 18.4 19.7 19 18.5
           C 19.3 19.5 19.6 20.6 19.6 21.5
           C 19.6 24 18 25.5 16 25.5
           C 13.5 25.5 12 23.7 12 21.5
           C 12 18.5 14 16.5 16 13.5 Z"
        fill={`url(#${id}-inner)`}
        opacity="0.95"
      />
    </svg>
  );
}

/** Flame + wordmark — for nav. */
export function Logo({
  size = 36,
  withGlow = false,
}: {
  size?: number;
  withGlow?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} withGlow={withGlow} />
      <span className="text-lg font-semibold tracking-tight">
        Roast<span className="text-ember-400">My</span>Site
      </span>
    </span>
  );
}
