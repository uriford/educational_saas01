import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function SaaSFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                <BookOpen className="h-4 w-4" />
              </div>

              <span className="text-[15px] font-bold tracking-tight">
                Uriford
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              Modern software for learning institutions that want simpler
              operations, better communication, and a more connected learning
              experience.
            </p>

          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Product
            </p>

            <div className="mt-5 space-y-3">
              <Link href="/features" className="block text-sm text-slate-500 hover:text-slate-950">
                Features
              </Link>
              <Link href="/solutions" className="block text-sm text-slate-500 hover:text-slate-950">
                Solutions
              </Link>
              <Link href="/pricing" className="block text-sm text-slate-500 hover:text-slate-950">
                Pricing
              </Link>
              <Link href="/docs" className="block text-sm text-slate-500 hover:text-slate-950">
                Documentation
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Resources
            </p>

            <div className="mt-5 space-y-3">
              <Link href="/resources" className="block text-sm text-slate-500 hover:text-slate-950">
                Resources
              </Link>
              <Link href="/faq" className="block text-sm text-slate-500 hover:text-slate-950">
                FAQ
              </Link>
              <Link href="/about" className="block text-sm text-slate-500 hover:text-slate-950">
                About
              </Link>
              <Link href="/contact" className="block text-sm text-slate-500 hover:text-slate-950">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Platform
            </p>

            <div className="mt-5 space-y-3">
              <Link href="/login" className="block text-sm text-slate-500 hover:text-slate-950">
                Sign in
              </Link>
              <Link href="/contact" className="block text-sm text-slate-500 hover:text-slate-950">
                Get started
              </Link>
              <Link href="/status" className="block text-sm text-slate-500 hover:text-slate-950">
                System status
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-slate-200 pt-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Uriford. All rights reserved.</p>

          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-slate-700">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-700">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
