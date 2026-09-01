"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function StudentsPageHeader() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">
          {t("dashboard.studentsPage.title")}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.studentsPage.description")}
        </p>
      </div>

      <Link href="/students/create" className="w-full sm:w-auto">
        <Button className="w-full sm:w-auto">
          {t("dashboard.studentsPage.addStudent")}
        </Button>
      </Link>
    </div>
  );
}
