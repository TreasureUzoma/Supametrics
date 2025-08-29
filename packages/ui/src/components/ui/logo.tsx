import Image from "next/image";
import Link from "next/link";

const Logo = ({
  showText = true,
  to = "/dashboard",
  width = 23,
  height = 23,
}: {
  showText?: boolean;
  to?: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Link className="inline-flex items-center justify-center gap-1" href={to}>
      <Image
        src="/logo.png"
        width={width}
        height={height}
        alt="Supametrics Logo"
        className="dark:invert"
      />
      {showText && (
        <span
          className="font-bold text-black dark:text-white"
          style={{ fontSize: `${width - 0.5}px` }}
        >
          supametrics
        </span>
      )}
    </Link>
  );
};

export default Logo;
