import {
  Building2,
  CalendarDays,
  GitBranch,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import DetailItem from "./DetailItem";

import type { StudentDetails } from "../../types/index";

type Props = {
  student: StudentDetails;
};

export default function OrganizationCard({
  student,
}: Props) {
  return (
    <Card className="rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Organization Information
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="grid gap-5 pt-6 md:grid-cols-3">

        <DetailItem
          icon={<Building2 size={18} />}
          label="Organization"
          value={student.organization.name}
        />

        <DetailItem
          icon={<GitBranch size={18} />}
          label="Branch"
          value={student.branch.name}
        />

        <DetailItem
          icon={<CalendarDays size={18} />}
          label="Admission Date"
          value={new Date(student.admissionDate).toLocaleDateString()}
        />

      </CardContent>
    </Card>
  );
}