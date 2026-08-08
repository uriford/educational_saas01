import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Props = {
  user: {
    email: string;
    role: string;
    status: string;
    emailVerified: boolean;
    lastLoginAt: Date | null;
  };
};

export default function AccountSecurity({
  user,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account & Security</CardTitle>
        <CardDescription>
          Review the security status of your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Role
            </p>
            <p className="font-medium">{user.role}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Account Status
            </p>
            <p className="font-medium">{user.status}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email Verification
            </p>
            <p className="font-medium">
              {user.emailVerified
                ? "Verified"
                : "Not verified"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Last Login
            </p>
            <p className="font-medium">
              {user.lastLoginAt
                ? user.lastLoginAt.toLocaleString()
                : "No login recorded"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}