import { ReactNode } from "react";

type DetailItemProps = {
  icon: ReactNode;
  label: string;
  value?: ReactNode;
};

export default function DetailItem({
  icon,
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40">
      <div className="mt-1 text-muted-foreground">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium break-words">
          {value ?? "-"}
        </p>
      </div>
    </div>
  );
}