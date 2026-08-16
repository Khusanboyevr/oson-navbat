import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";

interface LogoProps {
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  iconClassName?: string;
  textClassName?: string;
}

export default function Logo({
  href = "/",
  onClick,
  iconClassName = "h-8 w-auto",
  textClassName = "text-lg",
}: LogoProps) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2">
      <Image src="/icon-mark.png" alt="" width={338} height={331} priority className={iconClassName} />
      <span className={`font-sans font-extrabold leading-none ${textClassName}`}>
        <span className="text-primary">Qulay</span>
        <span className="text-accent">navbat</span>
      </span>
    </Link>
  );
}
