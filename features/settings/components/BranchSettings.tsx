import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Props = {
  branch: {
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isHeadquarters: boolean;
    status: string;
  } | null;
};

export default function BranchSettings({
  branch,
}: Props) {
  if (!branch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branch</CardTitle>
          <CardDescription>
            Your current branch information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            No branch is assigned to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Branch</CardTitle>
        <CardDescription>
          Information about the branch associated with your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Branch Name
            </p>
            <p className="font-medium">{branch.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Branch Code
            </p>
            <p className="font-medium">{branch.code}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>
            <p className="font-medium">
              {branch.email || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Phone
            </p>
            <p className="font-medium">
              {branch.phone || "Not provided"}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Address
            </p>
            <p className="font-medium">
              {branch.address || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>
            <p className="font-medium">{branch.status}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Headquarters
            </p>
            <p className="font-medium">
              {branch.isHeadquarters ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}