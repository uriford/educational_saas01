import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  search?: string;
  basePath: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  search,
  basePath,
}: Props) {
  if (totalPages <= 1) return null;

  const createHref = (page: number) => {
    const params = new URLSearchParams();

    params.set("page", String(page));

    if (search?.trim()) {
      params.set("search", search);
    }

    return `${basePath}?${params.toString()}`;
  };

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={createHref(Math.max(1, currentPage - 1))}
          className={`rounded-lg border px-3 py-2 text-sm transition ${
            currentPage === 1
              ? "pointer-events-none opacity-50"
              : "hover:bg-muted"
          }`}
        >
          Previous
        </Link>

        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={createHref(page)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                currentPage === page
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {page}
            </Link>
          ),
        )}

        <Link
          href={createHref(
            Math.min(totalPages, currentPage + 1),
          )}
          className={`rounded-lg border px-3 py-2 text-sm transition ${
            currentPage === totalPages
              ? "pointer-events-none opacity-50"
              : "hover:bg-muted"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}