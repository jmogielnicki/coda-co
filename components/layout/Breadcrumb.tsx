import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div className="px-10 py-[.65rem] text-[12px] text-ink bg-tr-vp border-b border-[rgba(193,99,79,.1)]">
      {crumbs.map((crumb, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-[6px]">›</span>}
          {crumb.href ? (
            <Link href={crumb.href} className="text-tr no-underline hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span>{crumb.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
