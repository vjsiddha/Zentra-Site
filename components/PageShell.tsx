// components/PageShell.tsx
interface PageShellProps { children: React.ReactNode }

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      {/* Full-width white canvas */}
      <div className="w-full bg-white px-6 py-8">
        {children}
      </div>
    </div>
  );
}
