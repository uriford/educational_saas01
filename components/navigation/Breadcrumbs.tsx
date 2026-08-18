"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

import {
  resolveBreadcrumbs,
  type BreadcrumbItem,
} from "./breadcrumbs.action";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const result = await resolveBreadcrumbs(pathname);

        if (!cancelled) {
          setItems(result);
        }
      } catch (error) {
        console.error(
          "Failed to resolve breadcrumbs:",
          error,
        );

        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (loading) {
    return (
      <div
        className="flex h-5 items-center"
        aria-label="Loading breadcrumb"
      >
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain scrollbar-none"
    >
      <ol className="flex w-max min-w-full items-center gap-1 whitespace-nowrap text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 shrink-0 items-center gap-1"
            >
              {index > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
              )}

              {isLast || !item.href ? (
                <span
                  className="block max-w-[180px] truncate font-medium text-foreground sm:max-w-[260px] lg:max-w-[360px]"
                  title={item.label}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="block max-w-[160px] truncate text-muted-foreground transition-colors hover:text-foreground sm:max-w-[220px] lg:max-w-[300px]"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
