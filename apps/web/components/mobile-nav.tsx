"use client";

import { useState } from "react";
import Link from "next/link";
import LinkButton from "@repo/ui/components/link-button";
import { ModeToggle } from "./mode-toggle";
import { Icons } from "@repo/ui/components/icons";
import Logo from "./logo";

const navItems = [
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
        <Icons
          type={open ? "times" : "menu"}
          width="29px"
          height="29px"
          color="#6B7280"
          className="rounded-full p-1 border border-neutral-200 dark:border-neutral-800"
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-black p-6">
          <div className="flex justify-between items-center mb-6">
            <Logo />
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <Icons
                color="#6b7280"
                className="rounded-full p-1 border border-neutral-200 dark:border-neutral-800"
                type="times"
                width="29px"
                height="29px"
              />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-center">
            <LinkButton className="text-base font-medium !py-1.5" href="/login">
              Login
            </LinkButton>
            <LinkButton
              className="text-base font-medium !py-1.5"
              variant="outline"
              href="/signup"
            >
              Get Started
            </LinkButton>
          </div>
          <nav className="mt-3 flex flex-col gap-4 text-neutral-800 dark:text-neutral-200">
            {navItems.map((item, idx) => (
              <Link key={idx} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}

            <div className="mt-4 flex flex-col gap-3 text-center border-t border-neutral-200 dark:border-neutral-900 pt-4">
              <div className="mr-auto">
                <ModeToggle />
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};
