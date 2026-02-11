export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#F8FDF9] to-[#50CF94]/5">
      {children}
    </div>
  );
}
