import Link from "next/link";

export function Footer() {
  // The footer's `border-radius: 50% 50% 0 0 / 60px 60px 0 0` carves an
  // arc out of its top edge; whatever section sits directly above shows
  // through that arc, so the transition tints itself to the section's bg.
  return (
    <>
      <footer className="bg-ch font-sans arc-top">
        <div className="max-w-[880px] mx-auto px-10 pt-12 pb-8 grid grid-cols-[1fr_auto_auto_auto] gap-10">
          {/* Brand */}
          <div>
            <div className="font-serif text-[28px] font-medium leading-none mb-3">
              <span className="text-tr">Coda</span>
              <span className="text-sg">Co</span>
            </div>
            <p className="text-[13px] text-cl leading-relaxed max-w-[200px]">
              A curated marketplace for death and dying. Based in the US.
            </p>
          </div>

          {/* Shop column */}
          <FooterColumn heading="Shop">
            <FooterLink href="/shop?category=urns">Urns &amp; vessels</FooterLink>
            <FooterLink href="/shop?category=jewelry">Ash jewelry</FooterLink>
            <FooterLink href="/shop?category=shrouds">Burial shrouds</FooterLink>
            <FooterLink href="/light-and-dark">Grief meets humor</FooterLink>
          </FooterColumn>

          {/* Services column */}
          <FooterColumn heading="Services">
            <FooterLink href="/services?type=doula">Death doulas</FooterLink>
            <FooterLink href="/services?type=attorney">Estate attorneys</FooterLink>
            <FooterLink href="/services?type=cleaner">Death cleaning</FooterLink>
            <FooterLink href="/services?type=celebrant">Celebrants</FooterLink>
          </FooterColumn>

          {/* Company column */}
          <FooterColumn heading="Company">
            <FooterLink href="/about">About CodaCo</FooterLink>
            <FooterLink href="/list-with-us">List with us</FooterLink>
            <FooterLink href="/where-to-start">Where to start</FooterLink>
            <FooterLink href="/guidance">Guidance</FooterLink>
            <FooterLink href="/faq">Help Center</FooterLink>
          </FooterColumn>
        </div>

        <div className="border-t border-[rgba(255,255,255,.08)] max-w-[880px] mx-auto px-10 py-5 flex items-center justify-between text-[12px] text-cl">
          <span>© 2025 CodaCo, Inc. · United States</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Terms of service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy policy</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
          <span>Made with intention.</span>
        </div>
      </footer>
    </>
  );
}

function FooterColumn({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[12px] font-medium tracking-[.08em] uppercase text-[rgba(255,255,255,.5)] mb-3">
        {heading}
      </h4>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[13px] text-cl hover:text-white transition-colors no-underline"
    >
      {children}
    </Link>
  );
}
