"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

export default function StudentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function handleChange(value: string) {
    setSearch(value);

    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.replace(`/students?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <Input
        className="w-full md:max-w-sm"
        value={search}
        placeholder="Search by name, phone or student ID..."
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}
