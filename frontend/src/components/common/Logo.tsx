import Image from "next/image";

// Single source of truth for the RAISE logo. All logo images come from /public/images/logo.
// Both files are the same official SVG (1461x400); only the fill color differs.
// - "light": for light/white backgrounds  -> logo-black.svg
// - "dark":  for dark/colored backgrounds -> logo-white.svg
const LOGO_SOURCES = {
  light: { src: "/images/logo/logo-black.svg", width: 1461, height: 400 },
  dark: { src: "/images/logo/logo-white.svg", width: 1461, height: 400 },
} as const;

type LogoProps = {
  variant?: keyof typeof LOGO_SOURCES;
  className?: string;
  priority?: boolean;
};

export default function Logo({ variant = "light", className = "h-8 w-auto", priority = true }: LogoProps) {
  const { src, width, height } = LOGO_SOURCES[variant];
  return <Image src={src} alt="RAISE" width={width} height={height} priority={priority} className={className} unoptimized />;
}
