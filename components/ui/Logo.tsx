import Image from "next/image";

export function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="CodaCo"
      width={44}
      height={44}
      priority
      className="block"
    />
  );
}
