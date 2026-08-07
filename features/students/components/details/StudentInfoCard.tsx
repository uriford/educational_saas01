import { Calendar, Mail, MapPin, Phone, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import DetailItem from "./DetailItem";

import type { StudentDetails } from "../../types/index";

type Props = {
  student: StudentDetails;
};

export default function StudentInfoCard({ student }: Props) {
  return (
    <Card className="rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
        <DetailItem
          icon={<Mail size={18} />}
          label="Email"
          value={student.email}
        />

        <DetailItem
          icon={<Phone size={18} />}
          label="Phone"
          value={student.phone}
        />

        <DetailItem
          icon={<User size={18} />}
          label="Gender"
          value={student.gender}
        />

        <DetailItem
          icon={<Calendar size={18} />}
          label="Date of Birth"
          value={
            student.dateOfBirth
              ? new Date(student.dateOfBirth).toLocaleDateString()
              : "-"
          }
        />

        <DetailItem
          icon={<MapPin size={18} />}
          label="Address"
          value={student.address}
        />
      </CardContent>
    </Card>
  );
}
