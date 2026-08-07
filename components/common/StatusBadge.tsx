import { Badge } from "../ui/badge";


type Props = {
  status: string;
};

export default function StatusBadge({
  status,
}: Props) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          🟢 Active
        </Badge>
      );

    case "INACTIVE":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          🔴 Inactive
        </Badge>
      );

    default:
      return (
        <Badge variant="secondary">
          {status}
        </Badge>
      );
  }
}