"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

const links = [
  { label: "Features", href: "/features" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Resources", href: "/resources" },
];

export default function SaaSNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <BookOpen className="h-4 w-4" />
          </div>

          <div className="leading-none">
            <span className="text-[15px] font-bold tracking-tight text-slate-950">
              Uriford
            </span>
            <span className="ml-1.5 text-[11px] font-medium text-slate-400">
              Platform
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            href="/features"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Features
          </Link>

          <Link
            href="/solutions"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Solutions
          </Link>

          <Link
            href="/pricing"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Pricing
          </Link>

          <Link
            href="/docs"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Docs
          </Link>

          <Link
            href="/resources"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Resources
          </Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Sign in
          </Link>

          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-4.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Get started
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 sm:hidden"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200/70 bg-white px-5 pb-5 sm:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sign in
              </Link>

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Get started
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
