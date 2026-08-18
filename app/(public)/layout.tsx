import PublicThemeProvider from "@/components/providers/PublicThemeProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicThemeProvider>
      <div className="min-h-screen bg-white text-slate-950">
        {children}
      </div>
    </PublicThemeProvider>
  );
}
