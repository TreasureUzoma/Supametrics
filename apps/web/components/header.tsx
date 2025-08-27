import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import LinkButton from "@repo/ui/components/link-button";
import { MobileNav } from "./mobile-nav";

export const Header = () => {
  const navItems = [
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between py-4 md:py-[0.6rem] bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-900">
      <div className="flex_center w-full">
        <div className="flex_between fixed_width">
          <div className="flex_center gap-12">
            <Logo />
            <div className="hidden lg:flex gap-6 text-neutral-500 font-semibold">
              {navItems.map((item, idx) => (
                <Link key={idx} href={item.href} className="supametrics-link">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex gap-6 text-neutral-500 font-semibold">
            <LinkButton href="/login">Login</LinkButton>
            <LinkButton variant="outline" href="/register">
              Signup
            </LinkButton>
            <ModeToggle />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
};
