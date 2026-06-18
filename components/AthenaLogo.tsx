import Image from "next/image";

interface AthenaLogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function AthenaLogo({
  className = "h-10 w-auto object-contain",
  width = 120,
  height = 40,
  priority = false,
}: AthenaLogoProps) {
  return (
    <Image
      src="/logo_athena.png"
      alt="Athena Logo"
      width={width}
      height={height}
      className={`${className} mix-blend-screen`}
      priority={priority}
    />
  );
}
