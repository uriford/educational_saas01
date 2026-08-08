import type { TeacherDetails } from "../types";


type Props = {
  teacher: TeacherDetails;
};


export default function TeacherProfile({
  teacher,
}: Props) {

return (

<div className="space-y-6">


<div className="rounded-xl border p-6">

<h2 className="text-xl font-semibold">
{teacher.firstName} {teacher.lastName}
</h2>


<p className="text-muted-foreground">
{teacher.teacherId}
</p>


</div>



<div className="grid gap-6 md:grid-cols-2">


<div className="rounded-xl border p-6">

<h3 className="font-semibold mb-4">
Personal Information
</h3>


<p>Email: {teacher.email ?? "-"}</p>

<p>
Phone: {teacher.phone ?? "-"}
</p>

<p>
Gender: {teacher.gender}
</p>

</div>



<div className="rounded-xl border p-6">

<h3 className="font-semibold mb-4">
Professional Information
</h3>


<p>
Qualification: {teacher.qualification ?? "-"}
</p>


<p>
Designation: {teacher.designation ?? "-"}
</p>


<p>
  Salary:
  {" "}
  {teacher.salary
    ? `৳${Number(teacher.salary).toLocaleString()}`
    : "-"}
</p>


</div>


</div>


</div>

);

}