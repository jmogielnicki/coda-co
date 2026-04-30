import type { ElementType, ReactNode } from "react";

type ContainerWidth = "narrow" | "mid" | "wide";

const widthClass: Record<ContainerWidth, string> = {
  narrow: "container-narrow",
  mid: "container-mid",
  wide: "container-wide",
};

interface ContainerProps {
  width: ContainerWidth;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Container({
  width,
  as: As = "div",
  className = "",
  children,
}: ContainerProps) {
  return <As className={`${widthClass[width]} ${className}`.trim()}>{children}</As>;
}
