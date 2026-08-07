"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

export default function TeacherSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? "",
  );

  function handleChange(value: string) {
    setSearch(value);

    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    router.replace(`/teachers?${params.toString()}`);
  }

  return (
    <Input
      className="w-full md:max-w-sm"
      placeholder="Search by teacher name, ID, phone or designation..."
      value={search}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}