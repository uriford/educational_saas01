import {
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
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

export default function GuardianCard({
  student,
}: Props) {
  return (
    <Card className="rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Guardian Information
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="grid gap-5 pt-6">

        <DetailItem
          icon={<UserRound size={18} />}
          label="Guardian Name"
          value={student.guardianName}
        />

        <DetailItem
          icon={<Mail size={18} />}
          label="Guardian Email"
          value={student.guardianEmail}
        />

        <DetailItem
          icon={<Phone size={18} />}
          label="Guardian Phone"
          value={student.guardianPhone}
        />

      </CardContent>

    </Card>
  );
}