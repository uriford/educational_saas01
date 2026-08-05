import { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthCard({
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold">{title}</h1>

        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}